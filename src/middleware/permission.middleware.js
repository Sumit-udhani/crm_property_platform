const prisma = require('../config/prisma');
const { isOrgAdminUser } = require('../utils/accessControl');

const methodActionMap = {
  GET:    'can_view',
  POST:   'can_create',
  PUT:    'can_edit',
  PATCH:  'can_edit',
  DELETE: 'can_delete',
};

const authorize = async (req, res, next) => {
  try {
    if (req.isSuperAdmin) return next();

    const userId = BigInt(req.user.userId);
      const isOrgAdmin = await isOrgAdminUser(userId);
    if (isOrgAdmin) return next();

    const action = methodActionMap[req.method];
    if (!action) return next();

    const skipSegments = new Set(['api', 'v1', 'admin']);
    const moduleSegment = req.originalUrl
      .split('?')[0]
      .split('/')
      .filter(s => s && !skipSegments.has(s) && isNaN(s))[0];

    if (!moduleSegment) return next();

    // Single query — get role + matching module permission
    const userRole = await prisma.user_roles.findFirst({
      where: { user_id: userId },
      select: { role_id: true },
    });

    if (!userRole) {
      return res.status(403).json({ success: false, message: 'No role assigned' });
    }

    const module = await prisma.modules.findFirst({
      where: { name: { equals: moduleSegment, mode: 'insensitive' } },
      select: { id: true },
    });

    if (!module) return next(); 

    const permission = await prisma.permissions_role.findUnique({
      where: {
        role_id_module_id: {
          role_id:   userRole.role_id,
          module_id: module.id,
        },
      },
      select: {
        can_view:   true,
        can_create: true,
        can_edit:   true,
        can_delete: true,
      },
    });

    if (!permission || !permission[action]) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    req.modulePermissions = permission; 
    next();

  } catch (err) {
    console.error('Authorize Error:', err);
    return res.status(500).json({ success: false, message: 'Authorization failed' });
  }
};

module.exports = { authorize };