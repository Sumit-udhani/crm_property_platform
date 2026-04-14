import axiosInstance from './axiosInstance'


const userService = {
  getUsers: async () => {
    const response = await axiosInstance.get('/admin/users');
    return response.data;
  },

  createUser: async (payload) => {
  
    const response = await axiosInstance.post('/admin/create/users', payload);
    return response.data;
  },
   getRoles: async () => {
    const response = await axiosInstance.get('/admin/roles');
    return response.data;
  },
    editUser: async (id, payload) => {
    const response = await axiosInstance.put(`/admin/users/${id}`, payload);
    return response.data;
  },
  updateUserStatus: async (id, payload) => {
   
    const response = await axiosInstance.patch(`/users/${id}/status`, payload);
    return response.data;
  },
};

export default userService;