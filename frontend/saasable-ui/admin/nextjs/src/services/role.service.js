import axiosInstance from './axiosInstance';

const roleService = {
  getRoles: async () => {
    const response = await axiosInstance.get('/admin/roles');
    return response.data;
  },

  createRole: async (payload) => {
    const response = await axiosInstance.post('/admin/roles', payload);
    return response.data;
  },

  editRole: async (id, payload) => {
    const response = await axiosInstance.put(`/admin/roles/${id}`, payload);
    return response.data;
  },

  deleteRole: async (id) => {
    const response = await axiosInstance.delete(`/admin/roles/${id}`);
    return response.data;
  },
};

export default roleService;