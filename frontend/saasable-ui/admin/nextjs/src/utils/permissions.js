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