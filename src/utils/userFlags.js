const prisma = require("../config/prisma");

exports.getUserFlags = async (userId) => {
  const user = await prisma.users.findUnique({
    where: { id: BigInt(userId) },
    select: {
      id: true,
      organization_id: true,
      user_roles: {
        select: {
          role_id: true,
        },
      },
    },
  });

  if (!user) {
    return {
      is_super_admin: false,
      is_org_admin: false,
      can_assign_organization: false,
      permissions: {},
    };
  }

  const roleId = user.user_roles?.[0]?.role_id;
  const isSuperAdmin = BigInt(roleId) === BigInt(6);


  const orConditions = [{ created_by: user.id }];

  if (user.organization_id) {
    orConditions.push({ id: user.organization_id });
  }

  const [orgCount, createdBySuperAdmin] = await Promise.all([
    prisma.organizations.count({
      where: {
        OR: orConditions,
      },
    }),

    prisma.team_members.findFirst({
      where: {
        user_id: user.id,
        created_by: BigInt(1),
      },
    }),
  ]);

  const isOrgAdmin =
    isSuperAdmin ||
    orgCount > 0 ||
    !!createdBySuperAdmin; 

  let permissions = {};

  if (roleId) {
    const rolePermissions = await prisma.permissions_role.findMany({
      where: { role_id: roleId },
      include: {
        modules: { select: { name: true } },
      },
    });

    rolePermissions.forEach((p) => {
      permissions[p.modules.name.toLowerCase()] = {
        can_create: p.can_create,
        can_view: p.can_view,
        can_edit: p.can_edit,
        can_delete: p.can_delete,
      };
    });
  }

  return {
    is_super_admin: isSuperAdmin,
    is_org_admin: isOrgAdmin,
    can_assign_organization: isSuperAdmin || isOrgAdmin,
    permissions,
  };
};