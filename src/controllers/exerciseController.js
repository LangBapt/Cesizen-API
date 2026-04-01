const prisma = require('../config/prisma');

// GET /api/exercises — Public
const getAllExercises = async (req, res) => {
  try {
    const exercises = await prisma.exercise.findMany({
      include: {
        composes: {
          include: { respirationPhase: true },
          orderBy: { phaseOrder: "asc" },
        },
      },
      orderBy: { id: "asc" },
    });
    return res.status(200).json(exercises);
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

// GET /api/exercises/:id — Public
const getExerciseById = async (req, res) => {
  try {
    const exercise = await prisma.exercise.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        composes: {
          include: { respirationPhase: true },
          orderBy: { phaseOrder: "asc" },
        },
      },
    });
    if (!exercise) return res.status(404).json({ message: "Exercice introuvable." });
    return res.status(200).json(exercise);
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

// POST /api/exercises — Admin
const createExercise = async (req, res) => {
  try {
    const { title, description, duration, instructions, phases } = req.body;
    if (!title || !description || !duration || !instructions) {
      return res.status(400).json({ message: "Champs obligatoires manquants." });
    }
    const exercise = await prisma.exercise.create({
      data: { title, description, duration: parseInt(duration), instructions },
    });
    if (phases && Array.isArray(phases)) {
      for (const phase of phases) {
        await prisma.compose.create({
          data: {
            exerciseId: exercise.id,
            respirationPhaseId: parseInt(phase.respirationPhaseId),
            phaseOrder: parseInt(phase.phaseOrder),
            durationSeconds: parseInt(phase.durationSeconds),
          },
        });
      }
    }
    await prisma.handle.create({
      data: { userId: req.user.id, exerciseId: exercise.id },
    });
    const full = await prisma.exercise.findUnique({
      where: { id: exercise.id },
      include: { composes: { include: { respirationPhase: true }, orderBy: { phaseOrder: "asc" } } },
    });
    return res.status(201).json({ message: "Exercice créé.", exercise: full });
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

// PUT /api/exercises/:id — Admin
const updateExercise = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, description, duration, instructions, phases } = req.body;
    const exercise = await prisma.exercise.update({
      where: { id },
      data: { title, description, duration: parseInt(duration), instructions },
    });
    if (phases && Array.isArray(phases)) {
      await prisma.compose.deleteMany({ where: { exerciseId: id } });
      for (const phase of phases) {
        await prisma.compose.create({
          data: {
            exerciseId: id,
            respirationPhaseId: parseInt(phase.respirationPhaseId),
            phaseOrder: parseInt(phase.phaseOrder),
            durationSeconds: parseInt(phase.durationSeconds),
          },
        });
      }
    }
    await prisma.handle.upsert({
      where: { userId_exerciseId: { userId: req.user.id, exerciseId: id } },
      update: { updateDate: new Date() },
      create: { userId: req.user.id, exerciseId: id },
    });
    const full = await prisma.exercise.findUnique({
      where: { id },
      include: { composes: { include: { respirationPhase: true }, orderBy: { phaseOrder: "asc" } } },
    });
    return res.status(200).json({ message: "Exercice mis à jour.", exercise: full });
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

// DELETE /api/exercises/:id — Admin
const deleteExercise = async (req, res) => {
  try {
    await prisma.exercise.delete({ where: { id: parseInt(req.params.id) } });
    return res.status(200).json({ message: "Exercice supprimé." });
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

// GET /api/exercises/phases — Admin/Public
const getAllPhases = async (req, res) => {
  try {
    const phases = await prisma.respirationPhase.findMany();
    return res.status(200).json(phases);
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

module.exports = { getAllExercises, getExerciseById, createExercise, updateExercise, deleteExercise, getAllPhases };