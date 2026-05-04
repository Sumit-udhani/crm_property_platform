const {generateCode} = require('../../../utils/generateCode');
const prisma = require("../../../config/prisma");
const { isOrgAdminUser,getAccessibleOrgIds } = require('../../../utils/accessControl');
const canAccessBranch = async (req, branchId) => {
  if (req.isSuperAdmin) return true;

  const userId = BigInt(req.user.userId);

  const orgIds = await getAccessibleOrgIds(req);

  if (orgIds.length > 0) {
    const branch = await prisma.branches.findFirst({
      where: {
        id: branchId,
        organization_id: { in: orgIds },
      },
    });

    if (branch) return true;
  }
  const assigned = await prisma.user_branches.findFirst({
    where: {
      user_id: userId,
      branch_id: branchId,
    },
  });

  return !!assigned;
};
exports.createBranch = async (req, res) => {
  try {
    const userId = BigInt(req.user.userId);
    const data = req.body;

    const requiredFields = [
      "organization_id",
      "name",
      "address_line_1",
      "city",
      "state",
      "country",
      "postal_code",
      "phone",
      "email",
    ];

    if (requiredFields.some((f) => !data[f])) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!/^\d{10}$/.test(data.phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone",
      });
    }

    if (!/^\S+@\S+\.\S+$/.test(data.email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email",
      });
    }

    const orgId = BigInt(data.organization_id);
    if (!req.isSuperAdmin) {
      const orgIds = await getAccessibleOrgIds(req);

      const hasAccess = orgIds.some((id) => BigInt(id) === orgId);

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "You can only create branches in your organization",
        });
      }
    }

    const code = await generateCode();

    const branchData = {
      name: data.name,
      address_line_1: data.address_line_1,
      address_line_2: data.address_line_2 || null,
      city: data.city,
      state: data.state,
      country: data.country,
      postal_code: data.postal_code,
      phone: data.phone,
      email: data.email,
    };

    const branch = await prisma.branches.create({
      data: {
        ...branchData,
        organization_id: orgId,
        code,
      },
    });

    return res.status(201).json({
      success: true,
      data: branch,
    });

  } catch (err) {
    console.error("Create Branch Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getBranches = async (req, res) => {
  try {
    const userId = BigInt(req.user.userId);

    let where = {};

    if (!req.isSuperAdmin) {
      const orgIds = await getAccessibleOrgIds(req);

      if (orgIds.length > 0) {
        where.organization_id = { in: orgIds };
      } else {
        const branchIds = (
          await prisma.user_branches.findMany({
            where: { user_id: userId },
            select: { branch_id: true },
          })
        ).map(b => b.branch_id);

        if (!branchIds.length) {
          return res.status(200).json({
            success: true,
            data: [],
            message: "No branch assigned",
          });
        }

        where.id = { in: branchIds };
      }
    }

    const branches = await prisma.branches.findMany({
      where,
      orderBy: { id: "desc" },
      select: {
        id: true,
        name: true,
        code: true,
        city: true,
        country: true,
        state: true,
        email: true,
        phone: true,
        postal_code: true,
        address_line_1: true,
        organization_id: true,
        organizations: { select: { name: true } },
        branch_projects: {
          include: {
            projects: { select: { id: true, name: true } }
          }
        }
      },
    });

    const enriched = await Promise.all(
      branches.map(async (b) => {
        const isCountryId = b.country && !isNaN(b.country);
        const isStateId = b.state && !isNaN(b.state);

        const [country, state] = await Promise.all([
          isCountryId
            ? prisma.countries.findUnique({ where: { id: BigInt(b.country) } })
            : null,
          isStateId
            ? prisma.states.findUnique({ where: { id: BigInt(b.state) } })
            : null,
        ]);

        return {
          ...b,
          id: b.id.toString(),
          country_id: isCountryId ? b.country.toString() : null,
          state_id: isStateId ? b.state.toString() : null,
          country: isCountryId ? (country?.name || "-") : (b.country || "-"),
          state: isStateId ? (state?.name || "-") : (b.state || "-"),
          organization_id: b.organization_id?.toString() || null,
          organization_name: b.organizations?.name || null,
          projects: b.branch_projects.map(p => ({
            id: p.projects.id.toString(),
            name: p.projects.name
          }))
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: enriched,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false });
  }
};
exports.editBranch = async (req, res) => {
  try {
    const branchId = BigInt(req.params.id);
    const { name, code, address_line_1, address_line_2, city, state, country, postal_code, phone, email, project_ids } = req.body;

    if ([name, code, address_line_1, city, state, country, postal_code, phone, email].some(f => !f))
      return res.status(400).json({ success: false, message: "All required fields must be provided" });

    if (!/^\d{10}$/.test(phone))
      return res.status(400).json({ success: false, message: "Invalid phone" });

    if (!/^\S+@\S+\.\S+$/.test(email))
      return res.status(400).json({ success: false, message: "Invalid email" });

    if (!await canAccessBranch(req, branchId))
      return res.status(403).json({ success: false, message: "Not allowed to update this branch" });

    const branch = await prisma.branches.findUnique({ where: { id: branchId } });
    if (!branch) return res.status(404).json({ success: false, message: "Branch not found" });

    if (code !== branch.code) {
      const exists = await prisma.branches.findFirst({
        where: { organization_id: branch.organization_id, code, NOT: { id: branchId } },
      });
      if (exists) return res.status(409).json({ success: false, message: "Code already exists" });
    }
    const parseIds = (ids) => {
      const arr = Array.isArray(ids) ? ids : typeof ids === 'string' ? ids.split(',') : [];
      return arr.map(id => id?.toString().trim()).filter(Boolean);
    };

    const result = await prisma.$transaction(async (tx) => {
      const updatedBranch = await tx.branches.update({
        where: { id: branchId },
        data: { name, code, address_line_1, address_line_2: address_line_2 ?? null, city, state, country, postal_code, phone, email },
      });

      if (project_ids !== undefined) {
        const parsedIds = parseIds(project_ids);

        if (parsedIds.length) {
          const conflicts = await tx.branch_projects.findMany({
            where: { project_id: { in: parsedIds.map(BigInt) }, NOT: { branch_id: branchId } },
          });
          if (conflicts.length) throw new Error("Some projects are already assigned to another branch");
        }

        await tx.branch_projects.deleteMany({ where: { branch_id: branchId } });

        if (parsedIds.length) {
          await tx.branch_projects.createMany({
            data: parsedIds.map(pid => ({ branch_id: branchId, project_id: BigInt(pid) })),
          });
        }
      }

      const branchProjects = await tx.branch_projects.findMany({
        where: { branch_id: branchId },
        include: { projects: { select: { id: true, name: true } } },
      });

      return {
        updatedBranch,
        projects: branchProjects.map(p => ({ id: p.projects.id.toString(), name: p.projects.name })),
      };
    });

    return res.status(200).json({
      success: true,
      message: "Branch updated successfully",
      data: { ...result.updatedBranch, projects: result.projects },
    });

  } catch (err) {
    console.error("Edit Branch Error:", err);
    return res.status(500).json({ success: false, message: err.message || "Server error" });
  }
};

