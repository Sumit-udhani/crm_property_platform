const prisma = require("../../../config/prisma");

const {generateCode} = require('../../../utils/generateCode');
const { isOrgAdminUser } = require('../../../utils/accessControl'); 
exports.createOrganization = async (req, res) => {
  try {
    const userId = BigInt(req.user.userId);

    const isOrgAdmin = await isOrgAdminUser(userId);

    const isAllowed =
      req.isSuperAdmin ||
      isOrgAdmin || 
      (await prisma.organizations.count({
        where: { created_by: userId },
      })) > 0;

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: "Not allowed to create organization",
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
        created_by: req.isSuperAdmin ? null : userId,
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
    const userId = BigInt(req.user.userId);

    let where = {};

    if (!req.isSuperAdmin) {
      const isOrgAdmin = await isOrgAdminUser(userId); 

      const orConditions = [
        { created_by: userId },
      ];

      if (req.user.organization_id) {
        orConditions.push({
          id: BigInt(req.user.organization_id),
        });
      }
      if (isOrgAdmin) {
        where = { OR: orConditions };
      } else {
        where = { OR: orConditions };
      }
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
    const userId = BigInt(req.user.userId);
    const orgId = BigInt(req.params.id);
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Organization name is required",
      });
    }

    const org = await prisma.organizations.findUnique({
      where: { id: orgId },
    });

    if (!org) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    const isOrgAdmin = await isOrgAdminUser(userId); 

    if (
      !req.isSuperAdmin &&
      !isOrgAdmin && 
      org.created_by !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Not allowed to edit this organization",
      });
    }

    const updated = await prisma.organizations.update({
      where: { id: orgId },
      data: { name },
    });

    return res.status(200).json({
      success: true,
      data: updated,
      message: "Organization updated successfully",
    });

  } catch (err) {
    console.error("Edit Org Error:", err);
    return res.status(500).json({ success: false });
  }
};

exports.deleteOrganization = async (req, res) => {
  try {
    const orgId = BigInt(req.params.id);
    const userId = BigInt(req.user.userId);

    const org = await prisma.organizations.findUnique({
      where: { id: orgId },
    });

    if (!org) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    if (!req.isSuperAdmin) {
      const isOrgAdmin = await isOrgAdminUser(userId);

      const createdOrgs = await prisma.organizations.findMany({
        where: { created_by: userId },
        select: { id: true }
      });

      const createdOrgIds = createdOrgs.map(o => o.id);

      const assignedOrgId = req.user.organization_id
        ? BigInt(req.user.organization_id)
        : null;

      const orgIds = [
        ...createdOrgIds,
        ...(assignedOrgId ? [assignedOrgId] : [])
      ];

      if (
        !isOrgAdmin &&
        !orgIds.some(id => BigInt(id) === orgId)
      ) {
        return res.status(403).json({
          success: false,
          message: "Not allowed to delete this organization",
        });
      }
    }

    const branchCount = await prisma.branches.count({
      where: { organization_id: orgId },
    });

    if (branchCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete organization with existing branches",
      });
    }

    await prisma.organizations.delete({
      where: { id: orgId },
    });

    return res.status(200).json({
      success: true,
      message: "Organization deleted successfully",
    });

  } catch (err) {
    console.error("Delete Organization Error:", err);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};