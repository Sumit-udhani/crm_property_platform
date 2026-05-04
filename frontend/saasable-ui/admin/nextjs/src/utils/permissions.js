export const isSuperAdmin = (user) => {
  return !!user?.is_super_admin;
};

export const isOrgAdmin = (user) => {
  return !!user?.is_org_admin;
};

export const canAssignOrganization = (user) => {
  return !!user?.can_assign_organization;
};


export const shouldShowOrganizationDropdown = (user) => {
  return canAssignOrganization(user);
};

/**
 * Checks if the user has a specific permission for a module.
 * @param {Object} user - The current user object from getMe
 * @param {string} moduleName - The name of the module (e.g., 'users')
 * @param {string} action - The action to check ('can_view', 'can_create', 'can_edit', 'can_delete')
 * @returns {boolean}
 */
export const hasPermission = (user, moduleName, action) => {
  if (!user) return false;
  

  if (isSuperAdmin(user) ||isOrgAdmin(user)) return true;
  
  if (!user.permissions || !moduleName) return false;
  
  const modulePerms = user.permissions[moduleName.toLowerCase()];
  if (!modulePerms) return false;
  
  return !!modulePerms[action];
};