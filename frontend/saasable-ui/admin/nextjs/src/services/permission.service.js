import axiosInstance from './axiosInstance';

const permissionService = {
  getPermissionsByRole: async (roleId) => {
    const res = await axiosInstance.get(`/permissions/${roleId}`);
    return res.data;
  },

  assignPermissions: async (data) => {
    const res = await axiosInstance.post('/permissions/assign', data);
    return res.data;
  },
};

export default permissionService;
