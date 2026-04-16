const express = require("express");
const router = express.Router();

const authController = require("../controllers/Auth/authController");
const authMiddleware = require("../middleware/auth.middleware");
const upload = require('../middleware/upload.middleware');


router.post("/login", authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post("/logout",authMiddleware, authController.logout);


router.post("/set-password", authController.setPassword);

router.get("/me", authMiddleware, authController.getMe);
router.put('/me',  authMiddleware, upload.single('profile_image'), authController.updateMe);
module.exports = router;