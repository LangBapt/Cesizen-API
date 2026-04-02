const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { 
  getAllExercises, 
  getExerciseById, 
  createExercise, 
  updateExercise, 
  deleteExercise, 
  getAllPhases 
} = require("../controllers/exerciseController");
const { verifyAccessToken } = require("../middlewares/authMiddleware");
const { isAdmin } = require("../middlewares/adminMiddleware");

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return next();

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (!err) req.user = decoded;
    next();
  });
};

router.get("/phases", optionalAuth, getAllPhases);
router.get("/", optionalAuth, getAllExercises);
router.get("/:id", optionalAuth, getExerciseById);

router.post("/", verifyAccessToken, isAdmin, createExercise);
router.put("/:id", verifyAccessToken, isAdmin, updateExercise);
router.delete("/:id", verifyAccessToken, isAdmin, deleteExercise);

module.exports = router;