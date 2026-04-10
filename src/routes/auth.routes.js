const express = require("express");
const router = express.Router();

const authController = require("../controllers/Auth/authController");
const authMiddleware = require("../middleware/auth.middleware");
// =============================
// 🔐 AUTH ROUTES
// =============================

// Login
router.post("/login", authController.login);
router.post("/logout",authMiddleware, authController.logout);

// Set Password (from email link)
router.post("/set-password", authController.setPassword);

router.get("/me", authMiddleware, authController.getMe);

module.exports = router;