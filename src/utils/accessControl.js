const prisma = require("../config/prisma");

exports.isOrgAdminUser = async (userId) => {
  const user = await prisma.users.findUnique({
    where: { id: BigInt(userId) },
    select: {
      id: true,
      organization_id: true,
      user_roles: {
        select: { role_id: true },
      },
    },
  });

  if (!user) return false;

  const roleId = user.user_roles?.[0]?.role_id;
  const isSuperAdmin = BigInt(roleId) === BigInt(6);

  const orConditions = [{ created_by: user.id }];

  if (user.organization_id) {
    orConditions.push({ id: user.organization_id });
  }

  const [orgCount, createdBySuperAdmin] = await Promise.all([
    prisma.organizations.count({
      where: { OR: orConditions },
    }),
    prisma.team_members.findFirst({
      where: {
        user_id: user.id,
        created_by: BigInt(1),
      },
    }),
  ]);

  return (
    isSuperAdmin ||
    orgCount > 0 ||
    !!createdBySuperAdmin
  );
};
exports.getAccessibleOrgIds = async (req) => {
  const userId = BigInt(req.user.userId);

  const createdOrgs = await prisma.organizations.findMany({
    where: { created_by: userId },
    select: { id: true },
  });

  const createdOrgIds = createdOrgs.map(o => o.id);

  const assignedOrgId = req.user.organization_id
    ? BigInt(req.user.organization_id)
    : null;

  return [
    ...createdOrgIds,
    ...(assignedOrgId ? [assignedOrgId] : []),
  ];
};