const express = require("express");
const router = express.Router();

const authController = require("../controllers/Auth/authController");

// =============================
// 🔐 AUTH ROUTES
// =============================

// Login
router.post("/login", authController.login);

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