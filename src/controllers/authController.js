const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generateAccessToken, generateRefreshToken } = require("../utils/generateTokens");
const prisma = require('../config/prisma');

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires." });
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      return res.status(409).json({ message: "Email ou nom d'utilisateur déjà utilisé." });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, email, password: hashed },
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    return res.status(201).json({
      message: "Compte créé avec succès.",
      accessToken,
      refreshToken,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    });
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis." });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.activated) {
      return res.status(401).json({ message: "Identifiants invalides ou compte désactivé." });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Identifiants invalides." });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    return res.status(200).json({
      message: "Connexion réussie.",
      accessToken,
      refreshToken,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    });
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token manquant." });
    }

    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored || stored.expiresAt < new Date()) {
      return res.status(403).json({ message: "Refresh token invalide ou expiré." });
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Refresh token invalide." });

      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!user || !user.activated) {
        return res.status(403).json({ message: "Utilisateur introuvable ou désactivé." });
      }

      try {
        await prisma.refreshToken.delete({
          where: {
            token: refreshToken,
          },
        });
      } catch (error) {
        if (error.code !== 'P2025') {
          throw error;
        }
      }

      const newAccessToken = generateAccessToken(user);
      const newRefreshToken = await generateRefreshToken(user);

      return res.status(200).json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    });
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }
    return res.status(200).json({ message: "Déconnexion réussie." });
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

module.exports = { register, login, refresh, logout };