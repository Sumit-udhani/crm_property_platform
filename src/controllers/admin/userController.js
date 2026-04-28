const prisma = require("../../config/prisma");
const { generateToken } = require("../../utils/jwt");
const { sendEmail } = require("../../utils/emailService");
const suspendedTemplate = require("../../templates/suspendedTemplate");
const reactivatedTemplate = require('../../templates/reactivatedTemplate')
const { setPasswordTemplate } = require("../../templates/setPassword.template");
const {getUserScopeWhere,getAllowedUserIds} = require('../../utils/teamScope')
exports.createUser = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      role_id,
      branch_ids = [],
      project_ids = [],
      organization_id 
    } = req.body;

    if (!first_name || !email || !role_id) {
      return res.status(400).json({
        success: false,
        message: "first_name, email, role_id are required",
      });
    }

    if (phone && !/^[0-9]{10}$/.test(String(phone))) {
      return res.status(400).json({
        success: false,
        message: "Phone must be 10 digits",
      });
    }

    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const creatorId = BigInt(req.user.userId);

    let isOrgAdmin = false;

    if (organization_id) {
      const org = await prisma.organizations.findFirst({
        where: {
          id: BigInt(organization_id),
          created_by: creatorId,
        },
      });

      if (!org) {
        return res.status(403).json({
          success: false,
          message: "You can only assign your own organization",
        });
      }

      isOrgAdmin = true;
    }

    const result = await prisma.$transaction(async (tx) => {

      const isSuperAdminRole = BigInt(role_id) === BigInt(1);

      const user = await tx.users.create({
        data: {
          first_name,
          last_name: last_name ?? null,
          email,
          phone: phone ?? null,
          password_hash: "",

          created_by: isSuperAdminRole ? null : creatorId,
          organization_id: isOrgAdmin ? BigInt(organization_id) : null,
        },
      });
      if (branch_ids.length) {
        await tx.user_branches.createMany({
          data: branch_ids.map((bId) => ({
            user_id: user.id,
            branch_id: BigInt(bId),
          })),
        });
      }
      if (project_ids.length) {
        await tx.user_projects.createMany({
          data: project_ids.map((pid) => ({
            user_id: user.id,
            project_id: BigInt(pid),
          })),
        });
      }
      await tx.user_roles.create({
        data: {
          user_id: user.id,
          role_id: BigInt(role_id),
        },
      });
      if (!isSuperAdminRole) {
        await tx.team_members.create({
          data: {
            user_id: user.id,
            created_by: creatorId,
          },
        });
      }

      const role = await tx.roles.findUnique({
        where: { id: BigInt(role_id) },
        select: { name: true },
      });

      return { user, role };
    });

    try {
      const token = generateToken(
        {
          userId: result.user.id.toString(),
          email: result.user.email,
          type: "SET_PASSWORD",
        },
        "15m"
      );

      const link = `${process.env.FRONTEND_URL}/set-password?token=${token}`;

      await sendEmail(
        email,
        "Set Your Password",
        setPasswordTemplate(first_name, link)
      );

    } catch (emailError) {
      console.error("Email failed:", emailError);
    }

    return res.status(201).json({
      success: true,
      message: "User created & email sent",
      data: {
        ...result.user,
        id: result.user.id.toString(),
        role_name: result.role?.name || null,
      },
    });

  } catch (error) {
    console.error("Create User Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



const formatUser = (user) => {
  const role = user.user_roles?.[0]?.roles ?? null;

  const branches = user.user_branches?.map((ub) => ({
    id: ub.branches.id,
    name: ub.branches.name,
  })) || [];
const projects = user.user_projects?.map(up => ({
  id: up.projects.id,
  name: up.projects.name,
})) || [];
  return {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    phone: user.phone,
    created_at: user.created_at,
    is_active: user.is_active,
    suspended_at: user.suspended_at,
    suspend_reason: user.suspend_reason,

    role_id: role?.id ?? null,
    role_name: role?.name ?? null,

    branches,
    branch_names: branches.map(b => b.name).join(', '),
      project_count: projects.length,
       projects,
  };
};
const userInclude = {
  user_branches: {
    include: {
      branches: {
        select: { id: true, name: true },
      },
    },
  },
  user_roles: {
    include: {
      roles: {
        select: { id: true, name: true },
      },
    },
  },
   user_projects: {
    include: {
      projects: { select: { id: true, name: true } },
    },
  },
};
exports.getUsers = async (req, res) => {
  try {
    const where = await getUserScopeWhere(req);

    const users = await prisma.users.findMany({
      where,
      include: userInclude,
      orderBy: { created_at: 'desc' },
    });

    const formatted = users.map(formatUser);

    return res.status(200).json({
      success: true,
      message: 'Users fetched successfully',
      data: formatted,
    });

  } catch (error) {
    console.error('Get Users Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

const parseIds = (ids) =>
  (Array.isArray(ids) ? ids : ids?.toString().split(',') ?? [])
    .map((id) => id?.toString().trim())
    .filter(Boolean);

exports.editUser = async (req, res) => {
  try {
    const userId = BigInt(req.params.id);
    const { first_name, last_name, email, phone, role_id, branch_ids, project_ids } = req.body;

    const allowedIds = await getAllowedUserIds(req);
    if (allowedIds !== null && !allowedIds.some((uid) => uid === userId)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const existingUser = await prisma.users.findUnique({ where: { id: userId } });
    if (!existingUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.users.update({
        where: { id: userId },
        data: {
          ...(first_name && { first_name }),
          ...(last_name  && { last_name }),
          ...(phone      && { phone }),
          ...(email      && { email }),
        },
      });
      if (role_id) {
        await tx.user_roles.updateMany({
          where: { user_id: userId },
          data:  { role_id: BigInt(role_id) },
        });
      }
      if (branch_ids !== undefined) {
        const ids = parseIds(branch_ids);
        await tx.user_branches.deleteMany({ where: { user_id: userId } });
        if (ids.length) {
          await tx.user_branches.createMany({
            data: ids.map((bid) => ({ user_id: userId, branch_id: BigInt(bid) })),
          });
        }
      }
      if (project_ids !== undefined) {
        const ids = parseIds(project_ids);
        await tx.user_projects.deleteMany({ where: { user_id: userId } });
        if (ids.length) {
          await tx.user_projects.createMany({
            data: ids.map((pid) => ({ user_id: userId, project_id: BigInt(pid) })),
          });
        }
      }

      const [role, userBranches] = await Promise.all([
        tx.user_roles.findFirst({
          where:   { user_id: userId },
          include: { roles: { select: { id: true, name: true } } },
        }),
        tx.user_branches.findMany({
          where:   { user_id: userId },
          include: { branches: { select: { id: true, name: true } } },
        }),
      ]);

      return { updatedUser, role, userBranches };
    });

    const { branch_id, ...cleanUser } = result.updatedUser;

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        ...cleanUser,
        role_id:   result.role?.roles?.id   ?? null,
        role_name: result.role?.roles?.name ?? null,
        branches:  result.userBranches.map((b) => ({
          id:   b.branches.id.toString(),
          name: b.branches.name,
        })),
      },
    });

  } catch (error) {
    console.error('Edit User Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
};
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    
    const allowedIds = await getAllowedUserIds(req);
    if (allowedIds !== null && !allowedIds.some(uid => uid === BigInt(id))) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const existingUser = await prisma.users.findUnique({ where: { id: BigInt(id) } });
    if (!existingUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await prisma.$transaction([
      prisma.team_members.deleteMany({ where: { user_id: BigInt(id) } }),
      prisma.user_roles.deleteMany({  where: { user_id: BigInt(id) } }),
      prisma.users.delete({           where: { id: BigInt(id) } }),
    ]);

    return res.status(200).json({ success: true, message: "User deleted successfully" });

  } catch (error) {
    console.error("Delete User Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};


exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, suspend_reason, suspend_days } = req.body;

    if (!["suspend", "reactivate", "deactivate"].includes(action)) {
      return res.status(400).json({ success: false, message: "Invalid action" });
    }

    const user = await prisma.users.findUnique({
      where: { id: BigInt(id) },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const suspendUntil = new Date();
    if (action === "suspend") {
      if (!suspend_reason || !suspend_days) {
        return res.status(400).json({
          success: false,
          message: "suspend_reason and suspend_days are required",
        });
      }
      suspendUntil.setDate(suspendUntil.getDate() + Number(suspend_days));
    }

    const data = {
      is_active: action === "reactivate",
      suspend_reason: action === "suspend" ? suspend_reason : null,
      suspended_at: action === "suspend" ? new Date() : null,
      suspend_until: action === "suspend" ? suspendUntil : null,
    };

    const updatedUser = await prisma.users.update({
      where: { id: BigInt(id) },
      data,
    });

    if (action === "suspend") {
      await sendEmail(
        user.email,
        "Your Account Has Been Suspended",
        suspendedTemplate(user.first_name, suspend_reason, suspendUntil)
      );
    }

    if (action === "reactivate") {
      await sendEmail(
        user.email,
        "Your Account Has Been Reactivated",
        reactivatedTemplate(user.first_name)
      );
    }

    return res.status(200).json({
      success: true,
      message:
        action === "suspend"
          ? `User suspended for ${suspend_days} day(s)`
          : action === "reactivate"
          ? "User reactivated successfully"
          : "User deactivated successfully",
      data: { ...updatedUser, id: updatedUser.id.toString() },
    });

  } catch (error) {
    console.error("Update User Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};