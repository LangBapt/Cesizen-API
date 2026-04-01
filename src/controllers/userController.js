const bcrypt = require("bcryptjs");
const prisma = require('../config/prisma');

// GET /api/users — Admin : liste tous les utilisateurs
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, email: true, role: true, createdAt: true, activated: true },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json(users);
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

// GET /api/users/:id — Admin ou utilisateur lui-même
const getUserById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (req.user.role !== "ADMIN" && req.user.id !== id) {
      return res.status(403).json({ message: "Accès non autorisé." });
    }
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true, email: true, role: true, createdAt: true, activated: true },
    });
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable." });
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

// PUT /api/users/:id — Utilisateur modifie son propre profil
const updateUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (req.user.role !== "ADMIN" && req.user.id !== id) {
      return res.status(403).json({ message: "Accès non autorisé." });
    }
    const { username, email } = req.body;
    const updated = await prisma.user.update({
      where: { id },
      data: { username, email },
      select: { id: true, username: true, email: true, role: true },
    });
    return res.status(200).json({ message: "Profil mis à jour.", user: updated });
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

// PUT /api/users/:id/password — Réinitialisation mot de passe
const resetPassword = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (req.user.id !== id) {
      return res.status(403).json({ message: "Accès non autorisé." });
    }
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id } });
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(401).json({ message: "Mot de passe actuel incorrect." });
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id }, data: { password: hashed } });
    return res.status(200).json({ message: "Mot de passe mis à jour." });
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

// PUT /api/users/:id/toggle — Admin : activer/désactiver un compte
const toggleUserActivation = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable." });
    const updated = await prisma.user.update({
      where: { id },
      data: { activated: !user.activated },
    });
    return res.status(200).json({
      message: `Compte ${updated.activated ? "activé" : "désactivé"}.`,
      activated: updated.activated,
    });
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

// PUT /api/users/:id/role — Admin : changer le rôle d'un utilisateur
const changeUserRole = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { role } = req.body;
    if (!["USER", "ADMIN"].includes(role)) {
      return res.status(400).json({ message: "Rôle invalide. Valeurs: USER, ADMIN" });
    }
    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, username: true, email: true, role: true },
    });
    return res.status(200).json({ message: "Rôle mis à jour.", user: updated });
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

// DELETE /api/users/:id — Admin : supprimer un compte
const deleteUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.user.delete({ where: { id } });
    return res.status(200).json({ message: "Compte supprimé." });
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

// POST /api/users — Admin : créer un compte
const createUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Champs obligatoires manquants." });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, email, password: hashed, role: role || "USER" },
      select: { id: true, username: true, email: true, role: true },
    });
    return res.status(201).json({ message: "Utilisateur créé.", user });
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

module.exports = { getAllUsers, getUserById, updateUser, resetPassword, toggleUserActivation, changeUserRole, deleteUser, createUser };