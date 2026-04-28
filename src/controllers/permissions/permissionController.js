
const prisma = require('../../config/prisma');
exports.createPermission = async (req, res) => {
  try {
    const { code, name, module_name } = req.body;

    if (!code || !name || !module_name) {
      return res.status(400).json({
        success: false,
        message: "code, name, module_name are required",
      });
    }

    const existing = await prisma.permissions.findUnique({
      where: { code },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Permission already exists",
      });
    }

    const permission = await prisma.permissions.create({
      data: {
        code: code.toLowerCase(),
        name,
        module_name,
      },
    });

    return res.status(201).json({
      success: true,
      data: permission,
    });
  } catch (err) {
    console.error("Create Permission Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getPermissions = async (req, res) => {
  try {
    const permissions = await prisma.permissions.findMany({
      orderBy: { id: "desc" },
    });

    return res.status(200).json({
      success: true,
      data: permissions,
    });
  } catch (err) {
    return res.status(500).json({ success: false });
  }
};

exports.assignPermissionsToRole = async (req, res) => {
  try {
    const { role_id, permission_ids } = req.body;
    const currentUserId = BigInt(req.user.userId);
    const currentRole = req.user.role;

    if (!role_id || !Array.isArray(permission_ids)) {
      return res.status(400).json({
        success: false,
        message: "role_id and permission_ids required",
      });
    }

   
    const targetRole = await prisma.roles.findUnique({
      where: { id: BigInt(role_id) },
    });

    if (!targetRole) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    
    if (
      currentRole !== "super admin" &&
      targetRole.name === "super admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot modify super admin role",
      });
    }

    if (currentRole !== "super admin") {
      const teamUsers = await prisma.team_members.findMany({
        where: { created_by: currentUserId },
        select: { user_id: true },
      });

      const allowedUserIds = teamUsers.map(u => u.user_id);

    
      const usersWithRole = await prisma.user_roles.findMany({
        where: { role_id: BigInt(role_id) },
        select: { user_id: true },
      });

      const isAllowed = usersWithRole.every(u =>
        allowedUserIds.includes(u.user_id)
      );

      if (!isAllowed) {
        return res.status(403).json({
          success: false,
          message: "You can only modify roles of your team users",
        });
      }
    }


    await prisma.role_permissions.deleteMany({
      where: { role_id: BigInt(role_id) },
    });

    const data = permission_ids.map(pid => ({
      role_id: BigInt(role_id),
      permission_id: BigInt(pid),
    }));

    await prisma.role_permissions.createMany({
      data,
      skipDuplicates: true,
    });

    return res.status(200).json({
      success: true,
      message: "Permissions assigned",
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false });
  }
};