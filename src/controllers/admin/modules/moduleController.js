const prisma = require("../../../config/prisma");
const { isOrgAdminUser } = require("../../../utils/accessControl");
exports.createModule = async (req, res) => {
  try {
    const userId = BigInt(req.user.userId);

    const isOrgAdmin = await isOrgAdminUser(userId);

    if (!req.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not allowed to create modules",
      });
    }

    const { name, parent_id } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Module name required",
      });
    }

    const module = await prisma.modules.create({
      data: {
        name,
        parent_id: parent_id ? BigInt(parent_id) : null,
      },
    });

    return res.status(201).json({
      success: true,
      data: module,
    });

  } catch (err) {
    console.error("Create Module Error:", err);
    return res.status(500).json({ success: false });
  }
};
exports.getModules = async (req, res) => {
  try {
    const userId = BigInt(req.user.userId);

    const isOrgAdmin = await isOrgAdminUser(userId);

    if (!req.isSuperAdmin && !isOrgAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not allowed to view modules",
      });
    }

    const modules = await prisma.modules.findMany({
      include: {
        children: true,
      },
      orderBy: { id: "asc" },
    });

    return res.status(200).json({
      success: true,
      data: modules,
    });

  } catch (err) {
    console.error("Get Modules Error:", err);
    return res.status(500).json({ success: false });
  }
};

exports.editModule = async (req, res) => {
  try {
    if (!req.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only super admin can edit modules",
      });
    }

    const moduleId = BigInt(req.params.id);
    const { name, parent_id } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Module name required",
      });
    }

    const existing = await prisma.modules.findUnique({
      where: { id: moduleId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    const updated = await prisma.modules.update({
      where: { id: moduleId },
      data: {
        name: name.trim(),
        parent_id: parent_id ? BigInt(parent_id) : null,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Module updated successfully",
      data: updated,
    });

  } catch (err) {
    console.error("Edit Module Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.deleteModule = async (req, res) => {
  try {
    if (!req.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only super admin can delete modules",
      });
    }

    const moduleId = BigInt(req.params.id);

    const module = await prisma.modules.findUnique({
      where: { id: moduleId },
      include: { children: true },
    });

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    if (module.children && module.children.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete module with child modules",
      });
    }

    const usedInPermissions = await prisma.permissions_role.findFirst({
      where: { module_id: moduleId },
    });

    if (usedInPermissions) {
      return res.status(400).json({
        success: false,
        message: "Module is used in permissions. Remove it first.",
      });
    }

    await prisma.modules.delete({
      where: { id: moduleId },
    });

    return res.status(200).json({
      success: true,
      message: "Module deleted successfully",
    });

  } catch (err) {
    console.error("Delete Module Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};