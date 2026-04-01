const express = require("express");
const router = express.Router();
const { getAllExercises, getExerciseById, createExercise, updateExercise, deleteExercise, getAllPhases } = require("../controllers/exerciseController");
const { verifyAccessToken } = require("../middlewares/authMiddleware");
const { isAdmin } = require("../middlewares/adminMiddleware");

router.get("/phases", getAllPhases);
router.get("/", getAllExercises);
router.get("/:id", getExerciseById);
router.post("/", verifyAccessToken, isAdmin, createExercise);
router.put("/:id", verifyAccessToken, isAdmin, updateExercise);
router.delete("/:id", verifyAccessToken, isAdmin, deleteExercise);

module.exports = router;