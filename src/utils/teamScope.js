const prisma = require("../config/prisma");
const { isOrgAdminUser,getAccessibleOrgIds} = require("./accessControl");
exports.getAllSubordinateUserIds = async (userId) => {
  const visited = new Set();
  const queue = [BigInt(userId)];

  while (queue.length) {
    const current = queue.shift();

    const children = await prisma.team_members.findMany({
      where: { created_by: current },
      select: { user_id: true },
    });

    for (const child of children) {
      const id = child.user_id;

      if (!visited.has(id)) {
        visited.add(id);
        queue.push(id);
      }
    }
  }

  return Array.from(visited);
};

exports.getUserScopeWhere = async (req) => {
  if (req.isSuperAdmin) return {};

  const userId = BigInt(req.user.userId);
  const subIds = await exports.getAllSubordinateUserIds(userId);
  const orgIds = await getAccessibleOrgIds(req);

  const orConditions = [
    { id: userId },
    { id: { in: subIds } },
  ];

  if (orgIds && orgIds.length > 0) {
    orConditions.push({
      organization_id: { in: orgIds },
    });

    orConditions.push({
      user_branches: {
        some: {
          branches: {
            organization_id: { in: orgIds },
          },
        },
      },
    });
    orConditions.push({
      user_projects: {
        some: {
          projects: {
            branch_projects: {
              some: {
                branches: {
                  organization_id: { in: orgIds },
                },
              },
            },
          },
        },
      },
    });
  }

  return {
    OR: orConditions,
  };
};

exports.getAllowedUserIds = async (req) => {
  if (req.isSuperAdmin) return null;

  const userId = BigInt(req.user.userId);
  const subIds = await exports.getAllSubordinateUserIds(userId);

  let ids = [userId, ...subIds];

const isOrgAdmin = await isOrgAdminUser(userId);

  if (isOrgAdmin) {
  const orgIds = await getAccessibleOrgIds(req);

  if (orgIds.length > 0) {
    const orgUsers = await prisma.users.findMany({
      where: {
        organization_id: { in: orgIds },
      },
      select: { id: true },
    });

    ids = [
      ...ids,
      ...orgUsers.map(u => u.id),
    ];
  }
}
  return Array.from(new Set(ids));
};