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
};

export default userService;