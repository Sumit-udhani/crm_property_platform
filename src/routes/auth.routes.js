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
// router.post("/set-password", authController.setPassword);

// // (Optional) Get current user
// const authMiddleware = require("../middleware/auth.middleware");
// router.get("/me", authMiddleware, (req, res) => {
//   return res.status(200).json({
//     success: true,
//     message: "User fetched successfully",
//     data: req.user,
//   });
// });

module.exports = router;