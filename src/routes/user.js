const express = require("express");
const router = express.Router();
const { getAllUsers, getUserById, updateUser, resetPassword, toggleUserActivation, changeUserRole, deleteUser, createUser } = require("../controllers/userController");
const { verifyAccessToken } = require("../middlewares/authMiddleware");
const { isAdmin } = require("../middlewares/adminMiddleware");

router.get("/", verifyAccessToken, isAdmin, getAllUsers);
router.post("/", verifyAccessToken, isAdmin, createUser);
router.get("/:id", verifyAccessToken, getUserById);
router.put("/:id", verifyAccessToken, updateUser);
router.put("/:id/password", verifyAccessToken, resetPassword);
router.put("/:id/toggle", verifyAccessToken, isAdmin, toggleUserActivation);
router.put("/:id/role", verifyAccessToken, isAdmin, changeUserRole);
router.delete("/:id", verifyAccessToken, isAdmin, deleteUser);

module.exports = router;