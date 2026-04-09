const prisma = require('../../config/prisma');
const { generateToken,verifyToken } = require("../../utils/jwt");
const bcrypt = require('bcrypt');

// ─── LOGIN ───
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

    // Generate token
    const token = generateToken({ userId: user.id.toString() },"24hr");

    // Calculate expiry (24h from now)
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    // Store token and expiry in DB
    await prisma.users.update({
      where: { id: user.id },
      data: {
        token: token,
        token_expiry: tokenExpires,
      }
    })

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        userId: user.id.toString(),
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

// ─── LOGOUT ───
exports.logout = async (req, res) => {
  try {
    const userId = BigInt(req.user.userId) // convert back to BigInt for DB

    // Clear token from DB
    await prisma.users.update({
      where: { id: userId },
      data: {
        token: null,
        token_expiry: null,
      }
    })

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    })

  } catch (error) {
    console.error("Logout Error:", error)
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}
exports.setPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    
    if (!token || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Token, password and confirmPassword are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // ✅ 3. Check token type
    if (decoded.type !== "SET_PASSWORD") {
      return res.status(400).json({
        success: false,
        message: "Invalid token type",
      });
    }

    // ✅ 4. Find user
    const user = await prisma.users.findUnique({
      where: { id: BigInt(decoded.userId) },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

   
    if (user.password_hash) {
      return res.status(400).json({
        success: false,
        message: "Password already set. Please login.",
      });
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);

   
    await prisma.users.update({
      where: { id: user.id },
      data: {
        password_hash: hashedPassword,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Password set successfully. Please login.",
    });

  } catch (error) {
    console.error("Set Password Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};