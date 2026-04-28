const prisma = require("../config/prisma");

exports.detectSuperAdmin = async (req, res, next) => {
  try {
    const userId = BigInt(req.user.userId);

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { created_by: true },
    });

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "User not found",
      });
    }

    req.user.isSuperAdmin = user.created_by === null;

    next();

  } catch (error) {
    console.error("SuperAdmin Detection Error:", error);
    return res.status(500).json({
      success: false,
      message: "Authorization failed",
    });
  }
};