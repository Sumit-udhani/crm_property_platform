const prisma = require("../config/prisma");

async function getAllSubordinateUserIds(userId) {
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
}

exports.getUserScopeWhere = async (req) => {
  if (req.isSuperAdmin) return {};

  const ids = await getAllSubordinateUserIds(req.user.userId);

  return {
    OR: [
      { id: BigInt(req.user.userId) },
      { id: { in: ids } }
    ]
  };
};


exports.getAllowedUserIds = async (req) => {
  if (req.isSuperAdmin) return null;

  const ids = await getAllSubordinateUserIds(req.user.userId);

  return [BigInt(req.user.userId), ...ids];
};