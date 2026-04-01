const jwt = require("jsonwebtoken");
const prisma = require('../config/prisma');

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }
  );
};

const generateRefreshToken = async (user) => {
  const token = jwt.sign(
    { id: user.id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" }
  );

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.upsert({
    where: {
      token: token, 
    },
    update: {
      expiresAt: expiresAt,
    },
    create: {
      token: token,
      userId: user.id,
      expiresAt: expiresAt,
    },
  });

  return token;
};

module.exports = { generateAccessToken, generateRefreshToken };