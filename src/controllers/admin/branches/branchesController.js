const {generateCode} = require('../../../utils/generateCode');
const prisma = require("../../../config/prisma");
const canAccessBranch = async (user, branchId) => {
  if (user.role === "super admin") return true;

  const branch = await prisma.branches.findFirst({
    where: {
      id: branchId,
      organizations: {
        created_by: BigInt(user.userId),
      },
    },
  });

  return !!branch;
};
exports.createBranch = async (req, res) => {
  try {
    const userId = BigInt(req.user.userId);
    const data = req.body;

    const requiredFields = [
      "organization_id", "name", "address_line_1",
      "city", "state", "country", "postal_code", "phone", "email"
    ];

    // ✅ Validation
    if (requiredFields.some(f => !data[f])) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!/^\d{10}$/.test(data.phone)) {
      return res.status(400).json({ success: false, message: "Invalid phone" });
    }

    if (!/^\S+@\S+\.\S+$/.test(data.email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }

    // ✅ 🔥 GET USER ROLES FROM DB
    const userRoles = await prisma.user_roles.findMany({
      where: { user_id: userId },
      include: { roles: true },
    });

    const roleNames = userRoles.map(r => r.roles.name.toLowerCase());

    // ✅ CHECK PERMISSION (NO HARDCODING IN TOKEN)
    if (!roleNames.includes("admin") && !roleNames.includes("super admin")) {
      return res.status(403).json({
        success: false,
        message: "Only Admin or Super Admin can create branches",
      });
    }

    const orgId = BigInt(data.organization_id);

    // ✅ Admin restriction: only their org
    if (roleNames.includes("admin")) {
      const org = await prisma.organizations.findFirst({
        where: { id: orgId, created_by: userId },
      });

      if (!org) {
        return res.status(403).json({
          success: false,
          message: "You can only create branches in your organization",
        });
      }
    }

  

    const code = await generateCode();

    const branch = await prisma.branches.create({
      data: {
        ...data,
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
    const role = req.user.role;

    let where = {};

    if (role !== "super admin") {
      if (role === "admin") {
        where.organizations = { created_by: userId };
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
        email:true,
        phone: true,
        postal_code:true,
        address_line_1:true,
        organization_id: true,
        organizations: { select: { name: true } },
        branch_projects: {
          include: {
            projects: {
              select: { id: true, name: true }
            }
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
          name: b.name,
          code: b.code,

          country_id: isCountryId ? b.country.toString() : null,
          state_id: isStateId ? b.state.toString() : null,

          country: isCountryId ? (country?.name || "-") : (b.country || "-"),
          state: isStateId ? (state?.name || "-") : (b.state || "-"),

          city: b.city || "-",
          email:b.email || "-",
          phone:b.phone || "-",
          address_line_1:b.address_line_1 || "-",
          postal_code:b.postal_code || "-",
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
    const user = req.user;
    const branchId = BigInt(req.params.id);
    const data = req.body;

    const {
      name,
      code,
      address_line_1,
      address_line_2,
      city,
      state,
      country,
      postal_code,
      phone,
      email,
      project_ids = [],
    } = data;

  
    const requiredFields = [
      name, code, address_line_1, city,
      state, country, postal_code, phone, email
    ];

    if (requiredFields.some(f => !f)) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, message: "Invalid phone" });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }

  
    const allowed = await canAccessBranch(user, branchId);
    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "Not allowed to update this branch",
      });
    }

   
    const branch = await prisma.branches.findUnique({
      where: { id: branchId },
    });

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

   
    if (code !== branch.code) {
      const exists = await prisma.branches.findFirst({
        where: {
          organization_id: branch.organization_id,
          code,
          NOT: { id: branchId },
        },
      });

      if (exists) {
        return res.status(409).json({
          success: false,
          message: "Code already exists",
        });
      }
    }

  
    const result = await prisma.$transaction(async (tx) => {

    
      const updatedBranch = await tx.branches.update({
        where: { id: branchId },
        data: {
          name,
          code,
          address_line_1,
          address_line_2: address_line_2 ?? null,
          city,
          state,
          country,
          postal_code,
          phone,
          email,
        },
      });

    
      if (project_ids !== undefined) {


        let parsedIds = [];

        if (Array.isArray(project_ids)) {
          parsedIds = project_ids;
        } else if (typeof project_ids === "string") {
          parsedIds = project_ids.split(",");
        }

        parsedIds = parsedIds
          .map(id => id?.toString().trim())
          .filter(Boolean);

  
       
        if (parsedIds.length > 0) {

     
        const alreadyAssigned = await tx.branch_projects.findMany({
          where: {
            project_id: {
              in: parsedIds.map(id => BigInt(id)),
            },
            NOT: {
              branch_id: branchId, // allow same branch reassignment
            },
          },
        });


          if (alreadyAssigned.length > 0) {
            throw new Error("Some projects are already assigned to another branch");
          }

         await tx.branch_projects.deleteMany({
          where: { branch_id: branchId },
        });

          await tx.branch_projects.createMany({
            data: parsedIds.map(pid => ({
              branch_id: branchId,
              project_id: BigInt(pid),
            })),
          });
        }
      }

     
      const branchProjects = await tx.branch_projects.findMany({
        where: { branch_id: branchId },
        include: {
          projects: {
            select: { id: true, name: true },
          },
        },
      });

      return {
        updatedBranch,
        projects: branchProjects.map(p => ({
          id: p.projects.id.toString(),
          name: p.projects.name,
        })),
      };
    });

    return res.status(200).json({
      success: true,
      message: "Branch updated successfully",
      data: {
        ...result.updatedBranch,
        projects: result.projects,
      },
    });

  } catch (err) {
    console.error("Edit Branch Error:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};