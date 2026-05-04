import axiosInstance from './axiosInstance';

const moduleService = {
  createModule: async (data) => {
    const res = await axiosInstance.post('/modules', data);
    return res.data;
  },

  getModules: async () => {
    const res = await axiosInstance.get('/modules');
    return res.data;
  },

  editModule: async (id, data) => {
    const res = await axiosInstance.put(`/modules/${id}`, data);
    return res.data;
  },

  deleteModule: async (id) => {
    const res = await axiosInstance.delete(`/modules/${id}`);
    return res.data;
  },
};

export default moduleService;
