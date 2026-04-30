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
    };
  }

  const roleId = user.user_roles?.[0]?.role_id;
  const isSuperAdmin = BigInt(roleId) === BigInt(6);

  const orConditions = [
    { created_by: user.id },
  ];

  if (user.organization_id) {
    orConditions.push({ id: user.organization_id });
  }

  const orgCount = await prisma.organizations.count({
    where: {
      OR: orConditions,
    },
  });

  const isOrgAdmin = orgCount > 0;

  return {
    is_super_admin: isSuperAdmin,
    is_org_admin: isOrgAdmin,
    can_assign_organization: isSuperAdmin || isOrgAdmin,
  };
};