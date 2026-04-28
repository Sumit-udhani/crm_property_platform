const prisma = require("../../config/prisma");


exports.getRoles = async (req, res) => {
  try {
    const userId = BigInt(req.user.userId);
    const role = req.user.role;

    let where = {};
    if (role !== "super admin") {
      
    
      const teamMembers = await prisma.team_members.findMany({
        where: { created_by: userId },
        select: { user_id: true },
      });

      const teamUserIds = teamMembers.map(m => m.user_id);


      teamUserIds.push(userId);

      where.created_by = {
        in: teamUserIds,
      };
    }

    const roles = await prisma.roles.findMany({
      where,
      select: {
        id: true,
        name: true,
  
      },
      orderBy: { id: "desc" },
    });

    return res.status(200).json({
      success: true,
      data: roles,
    });

  } catch (err) {
    console.error("GET ROLES ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};


exports.createRole = async (req, res) => {
  try {
    let { name } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Role name required",
      });
    }

    name = name.trim().toLowerCase();

    const exists = await prisma.roles.findFirst({ where: { name } });

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Role already exists",
      });
    }

    const creatorId = BigInt(req.user.userId);

    const role = await prisma.roles.create({
      data: {
        name,
        created_by: creatorId, 
      },
      select: { id: true, name: true},
    });

    return res.status(201).json({
      success: true,
      data: role,
    });

  } catch (error) {
    console.error("CREATE ROLE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
exports.editRole = async (req, res) => {
  try {
    const { id } = req.params;
    let { name,  } = req.body;

    const roleId = BigInt(id);

    const role = await prisma.roles.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    const data = {};

   
    if (name?.trim()) {
      name = name.trim().toLowerCase();

      const duplicate = await prisma.roles.findFirst({
        where: {
          name,
          NOT: { id: roleId },
        },
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "Role already exists",
        });
      }

      data.name = name;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Nothing to update",
      });
    }

    const updated = await prisma.roles.update({
      where: { id: roleId },
      data,
      select: { id: true, name: true },
    });

    return res.status(200).json({
      success: true,
      message: "Role updated successfully",
      data: updated,
    });

  } catch (error) {
    console.error("Edit Role Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    const roleId = BigInt(id);

    const assignedUsers = await prisma.user_roles.count({
      where: { role_id: roleId },
    });

    if (assignedUsers > 0) {
      return res.status(409).json({
        success: false,
        message: "Role is assigned to users",
      });
    }

    await prisma.roles.delete({ where: { id: roleId } });

    return res.status(200).json({
      success: true,
      message: "Role deleted",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};