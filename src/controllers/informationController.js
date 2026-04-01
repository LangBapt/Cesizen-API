const prisma = require('../config/prisma');

// GET /api/informations — Public : liste les infos actives
const getAllInformations = async (req, res) => {
  try {
    const where = req.user?.role === "ADMIN" ? {} : { status: true };
    const infos = await prisma.information.findMany({
      where,
      orderBy: { publicationDate: "desc" },
    });
    return res.status(200).json(infos);
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

// GET /api/informations/:id — Public
const getInformationById = async (req, res) => {
  try {
    const info = await prisma.information.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!info) return res.status(404).json({ message: "Information introuvable." });
    return res.status(200).json(info);
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

// POST /api/informations — Admin
const createInformation = async (req, res) => {
  try {
    const { title, description, content, category } = req.body;
    if (!title || !description || !content || !category) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires." });
    }
    const info = await prisma.information.create({
      data: { title, description, content, category },
    });
    await prisma.manage.create({
      data: { userId: req.user.id, informationId: info.id },
    });
    return res.status(201).json({ message: "Information créée.", information: info });
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

// PUT /api/informations/:id — Admin
const updateInformation = async (req, res) => {
  try {
    const { title, description, content, category, status } = req.body;
    const info = await prisma.information.update({
      where: { id: parseInt(req.params.id) },
      data: { title, description, content, category, status },
    });
    await prisma.manage.upsert({
      where: { userId_informationId: { userId: req.user.id, informationId: info.id } },
      update: { updateDate: new Date() },
      create: { userId: req.user.id, informationId: info.id },
    });
    return res.status(200).json({ message: "Information mise à jour.", information: info });
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

// DELETE /api/informations/:id — Admin
const deleteInformation = async (req, res) => {
  try {
    await prisma.information.delete({ where: { id: parseInt(req.params.id) } });
    return res.status(200).json({ message: "Information supprimée." });
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

module.exports = { getAllInformations, getInformationById, createInformation, updateInformation, deleteInformation };