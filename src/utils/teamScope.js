const prisma = require("../config/prisma");

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

  const orConditions = [
    { id: userId },                
    { id: { in: subIds } },         
  ];

  if (req.user.organization_id) {
    orConditions.push({
      organization_id: BigInt(req.user.organization_id),
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


  if (req.user.organization_id) {
    const orgUsers = await prisma.users.findMany({
      where: {
        organization_id: BigInt(req.user.organization_id),
      },
      select: { id: true },
    });

    ids = [
      ...ids,
      ...orgUsers.map(u => u.id),
    ];
  }

  return Array.from(new Set(ids));
};