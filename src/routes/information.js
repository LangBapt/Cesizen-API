const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { 
  getAllInformations, 
  getInformationById, 
  createInformation, 
  updateInformation, 
  deleteInformation 
} = require("../controllers/informationController");
const { verifyAccessToken } = require("../middlewares/authMiddleware");
const { isAdmin } = require("../middlewares/adminMiddleware");

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return next();

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (!err) {
      req.user = decoded;
    }
    next();
  });
};


router.get("/", optionalAuth, getAllInformations);
router.get("/:id", optionalAuth, getInformationById);
router.post("/", verifyAccessToken, isAdmin, createInformation);
router.put("/:id", verifyAccessToken, isAdmin, updateInformation);
router.delete("/:id", verifyAccessToken, isAdmin, deleteInformation);

module.exports = router;