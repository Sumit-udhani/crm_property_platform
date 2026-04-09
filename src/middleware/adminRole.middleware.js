const prisma = require("../config/prisma");

exports.isSuperAdmin = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const userRole = await prisma.user_roles.findFirst({
      where: { user_id: BigInt(userId) },
      include: { roles: true },
    });

    if (userRole?.roles?.name !== "SUPER ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Super Admin only.",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Authorization error",
    });
  }
};