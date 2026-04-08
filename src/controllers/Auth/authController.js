const prisma = require('../../config/prisma');

const { generateToken } = require("../../utils/jwt");
const bcrypt = require('bcrypt');
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.password_hash) {
      return res.status(403).json({
        success: false,
        message: "Please set your password first",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken({ userId: user.id });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        userId: user.id,
      },
    });

  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};