const prisma = require("../../../config/prisma");
exports.createModule = async (req, res) => {
  try {
      if (!req.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only super admin can create modules",
      });
    }
    const { name, parent_id } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Module name required" });
    }

    const module = await prisma.modules.create({
      data: {
        name,
        parent_id: parent_id ? BigInt(parent_id) : null,
      },
    });

    return res.status(201).json({ success: true, data: module });

  } catch (err) {
    console.error("Create Module Error:", err);
    return res.status(500).json({ success: false });
  }
};

exports.getModules = async (req, res) => {
  try {
    if (!req.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only super admin can view modules",
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