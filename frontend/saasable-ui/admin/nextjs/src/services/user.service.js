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
  deleteUser: async (id) => {
  const response = await axiosInstance.delete(`/admin/users/${id}`);
  return response.data;
},
  updateUserStatus: async (id, payload) => {
   
    const response = await axiosInstance.patch(`/admin/users/${id}/status`, payload);
    return response.data;
  },
};

export default userService;