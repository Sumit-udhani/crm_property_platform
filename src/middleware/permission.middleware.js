const prisma = require("../config/prisma");

exports.authorize = (permissionCode) => {
  return async (req, res, next) => {
    try {
      const userId = BigInt(req.user.userId);

      const user = await prisma.users.findUnique({
        where: { id: userId },
        include: {
          user_roles: {
            include: {
              roles: {
                include: {
                  role_permissions: {
                    include: { permissions: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!user || !user.user_roles.length) {
        return res.status(403).json({
          success: false,
          message: "No role assigned",
        });
      }

      const role = user.user_roles[0].roles;

     
      if (role.name === "super admin") {
        req.user.role = role.name;
        return next();
      }

   
      const totalPermissions = await prisma.permissions.count();

      if (totalPermissions === 0 && role.name === "admin") {
        return next();
      }

     
      const hasPermission = role.role_permissions.some(
        (rp) => rp.permissions.code === permissionCode
      );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: "Permission denied",
        });
      }

      req.user.role = role.name;
      next();

    } catch (err) {
      console.error("Auth Error:", err);
      return res.status(500).json({
        success: false,
        message: "Authorization failed",
      });
    }
  };
};