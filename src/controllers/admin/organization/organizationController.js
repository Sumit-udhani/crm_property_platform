const prisma = require("../../../config/prisma");

const {generateCode} = require('../../../utils/generateCode');

exports.createOrganization = async (req, res) => {
  try {
    
    const userId = BigInt(req.user.userId);
    const role = req.user.role?.toLowerCase();
 if (!["super admin", "admin"].includes(role)) {
      return res.status(403).json({
        success: false,
        message: "Only admin or super admin can create organization",
      });
    }
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Organization name is required",
      });
    }

    
    const code = await generateCode();

    const org = await prisma.organizations.create({
      data: {
        name,
        code,
        created_by: userId,
      },
    });

    return res.status(201).json({
      success: true,
      data: org,
    });

  } catch (err) {
    console.error("Create Org Error:", err);
    return res.status(500).json({ success: false });
  }
};

exports.getOrganizations = async (req, res) => {
  try {
    let where = {};

    
    if (req.user.role === "admin") {
      where.created_by = BigInt(req.user.userId);
    }

    const orgs = await prisma.organizations.findMany({
      where,
      select: {
        id: true,
        name: true,
        code: true, 
        created_at: true,
      },
      orderBy: { id: "desc" },
    });

    return res.status(200).json({
      success: true,
      data: orgs,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false });
  }
};

exports.editOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (req.user.role !== "super admin") {
      return res.status(403).json({
        success: false,
        message: "Only super admin can edit organizations",
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Organization name is required",
      });
    }

    const existingOrg = await prisma.organizations.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existingOrg) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    const org = await prisma.organizations.update({
      where: { id: BigInt(id) },
      data: { name },
    });

    return res.status(200).json({
      success: true,
      data: org,
      message: "Organization updated successfully",
    });
  } catch (err) {
    console.error("Edit Org Error:", err);
    return res.status(500).json({ success: false });
  }
};