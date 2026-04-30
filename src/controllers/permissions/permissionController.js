const prisma = require('../../config/prisma');

exports.assignPermissions = async (req, res) => {
  try {
    if (!req.isSuperAdmin) {
      return res.status(403).json({ success: false, message: 'Only super admin can assign permissions' });
    }

    const { role_id, permissions } = req.body;

    if (!role_id || !Array.isArray(permissions)) {
      return res.status(400).json({ success: false, message: 'role_id and permissions required' });
    }

    const roleId = BigInt(role_id);

    await prisma.permissions_role.deleteMany({ where: { role_id: roleId } });

    const data = permissions.map(p => ({
      role_id:    roleId,
      module_id:  BigInt(p.module_id),  
      can_create: !!p.can_create,
      can_view:   !!p.can_view,
      can_edit:   !!p.can_edit,
      can_delete: !!p.can_delete,
    }));

    await prisma.permissions_role.createMany({ data });

    return res.status(200).json({ success: true, message: 'Permissions assigned successfully' });

  } catch (err) {
    console.error('Assign Permission Error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.getPermissionsByRole = async (req, res) => {
  try {
    if (!req.isSuperAdmin) {
      return res.status(403).json({ success: false, message: 'Only super admin can view permissions' });
    }

    const roleId = BigInt(req.params.role_id);

   
    const modules = await prisma.modules.findMany({
      where:   { parent_id: null },
      include: { children: true },
      orderBy: { id: 'asc' },
    });

    const permissions = await prisma.permissions_role.findMany({
      where: { role_id: roleId },
    });

    // Key by module_id string
    const permissionMap = {};
    permissions.forEach(p => {
      permissionMap[p.module_id.toString()] = p;
    });

    const getPerms = (id) => ({
      can_create: permissionMap[id.toString()]?.can_create || false,
      can_view:   permissionMap[id.toString()]?.can_view   || false,
      can_edit:   permissionMap[id.toString()]?.can_edit   || false,
      can_delete: permissionMap[id.toString()]?.can_delete || false,
    });

    const result = modules.map(m => ({
      id:          m.id.toString(),
      name:        m.name,
      parent_id:   null,
      permissions: getPerms(m.id),
      children:    m.children.map(c => ({
        id:          c.id.toString(),
        name:        c.name,
        parent_id:   m.id.toString(),
        permissions: getPerms(c.id),
      })),
    }));

    return res.status(200).json({ success: true, data: result });

  } catch (err) {
    console.error('Get Permissions Error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};