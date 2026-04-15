const prisma = require("../../config/prisma");


exports.getRoles = async (req, res) => {
  try {
    const roles = await prisma.roles.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Roles fetched successfully",
      data: roles,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching roles",
    });
  }
};
exports.createRole = async (req, res) => {
  try {
    const { name} = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Role name is required",
      });
    }

    const existing = await prisma.roles.findFirst({
      where: { name: name.trim().toLowerCase() },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Role with this name already exists",
      });
    }

    const role = await prisma.roles.create({
      data: { name: name.trim().toLowerCase() },
      select: { id: true, name: true },
    });

    return res.status(201).json({
      success: true,
      message: "Role created successfully",
      data: role,
    });
  } catch (error) {
    console.error("Create Role Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
exports.editRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Role name is required",
      });
    }

    const existingRole = await prisma.roles.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existingRole) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    const duplicate = await prisma.roles.findFirst({
      where: {
        name: name.trim().toLowerCase(),
        NOT: { id: BigInt(id) },
      },
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Role with this name already exists",
      });
    }

    const updated = await prisma.roles.update({
      where: { id: BigInt(id) },
      data: { name: name.trim().toLowerCase() },
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
      error: error.message,
    });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    const existingRole = await prisma.roles.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existingRole) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    
    const assignedUsers = await prisma.user_roles.count({
      where: { role_id: BigInt(id) },
    });

    if (assignedUsers > 0) {
      return res.status(409).json({
        success: false,
        message: `Cannot delete this role. It is currently assigned to ${assignedUsers} user(s). Please reassign them first.`,
      });
    }

    await prisma.roles.delete({
      where: { id: BigInt(id) },
    });

    return res.status(200).json({
      success: true,
      message: "Role deleted successfully",
    });
  } catch (error) {
    console.error("Delete Role Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};