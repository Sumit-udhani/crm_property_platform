const prisma = require('../../config/prisma');
const { generateToken,verifyToken } = require("../../utils/jwt");
const bcrypt = require('bcrypt');
const { sendEmail } = require("../../utils/emailService");
const forgotPasswordTemplate = require('../../templates/forgotPasswordTemplate')

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

    if (!user.is_active && !user.suspended_at) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Please contact support.",
      });
    }
      if (user.suspended_at && user.suspend_until) {
      return res.status(403).json({
        success: false,
        message: `Your account is suspended until ${new Date(user.suspend_until).toDateString()}. Reason: ${user.suspend_reason}`,
      });
    }
    const token = generateToken({ userId: user.id.toString() },"24hr");

    
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

   
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

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await prisma.users.findUnique({
      where: { email },
    });

    
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If this email is registered, you will receive a reset link shortly.",
      });
    }

    
    if (!user.password_hash) {
      return res.status(200).json({
        success: true,
        message: "If this email is registered, you will receive a reset link shortly.",
      });
    }

    const token = generateToken(
      {
        userId: user.id,
        email:  user.email,
        type:   "SET_PASSWORD",
      },
      "15m"
    );

    const link = `${process.env.FRONTEND_URL}/set-password?token=${token}`;

    await sendEmail(
      user.email,
      "Reset Your Password",
      forgotPasswordTemplate(user.first_name, link)
    );

    return res.status(200).json({
      success: true,
      message: "If this email is registered, you will receive a reset link shortly.",
    });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
exports.logout = async (req, res) => {
  try {
    const userId = BigInt(req.user.userId) 

    
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
exports.getMe = async (req, res) => {
  try {
    const userId = BigInt(req.user.userId);

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id:            true,
        first_name:    true,
        last_name:     true,
        email:         true,
        phone:         true,
        is_active:     true,
        profile_image: true,
        user_roles: {
          select: {
            roles: { select: { name: true } }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: {
        id:            user.id.toString(),
        first_name:    user.first_name,
        last_name:     user.last_name,
        email:         user.email,
        phone:         user.phone,
        profile_image: user.profile_image
          ? `${process.env.BASE_URL}/${user.profile_image}`
          : null,
        role_name:     user.user_roles[0]?.roles?.name || null,
      }
    });

  } catch (error) {
    console.error("Get Me Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const userId = BigInt(req.user.userId);
    const { first_name, last_name, phone } = req.body;

    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        user_roles: { include: { roles: true } }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const updateData = {};
    if (first_name) updateData.first_name = first_name;
    if (last_name)  updateData.last_name  = last_name;
    if (phone)      updateData.phone      = phone;

   
    if (req.file) {
      
      if (user.profile_image) {
        const fs   = require('fs');
        const path = require('path');
        const oldPath = path.join(__dirname, '../../', user.profile_image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updateData.profile_image = req.file.path.replace(/\\/g, '/'); 
    }

    const updated = await prisma.users.update({
      where: { id: userId },
      data:  updateData,
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id:            updated.id.toString(),
        first_name:    updated.first_name,
        last_name:     updated.last_name,
        email:         updated.email,
        phone:         updated.phone,
        profile_image: updated.profile_image
          ? `${process.env.BASE_URL}/${updated.profile_image}`
          : null,
        role_name:     user.user_roles[0]?.roles?.name || null,
      }
    });

  } catch (error) {
    console.error("Update Me Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};