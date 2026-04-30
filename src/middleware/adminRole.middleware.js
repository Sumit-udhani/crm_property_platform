const prisma = require("../config/prisma");
const { getUserFlags } = require("../utils/userFlags");
exports.detectSuperAdmin = async (req, res, next) => {
  try {
    const userId = BigInt(req.user.userId);

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        organization_id: true,
        user_roles: {
          select: {
            role_id: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "User not found",
      });
    }

    const roleId = user.user_roles?.[0]?.role_id;

    req.isSuperAdmin = BigInt(roleId) === BigInt(6);

    req.user.organization_id = user.organization_id;

    next();

  } catch (error) {
    console.error("SuperAdmin Detection Error:", error);
    return res.status(500).json({
      success: false,
      message: "Authorization failed",
    });
  }
};