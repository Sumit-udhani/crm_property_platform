import axiosInstance from './axiosInstance'

const branchService = {
  getBranches: async () => {
    const response = await axiosInstance.get('/branches');
    return response.data;
  },

  createBranch: async (payload) => {
    const response = await axiosInstance.post('/branches', payload);
    return response.data;
  },

  editBranch: async (id, payload) => {
    const response = await axiosInstance.put(`/branches/${id}`, payload);
    return response.data;
  },
};

export default branchService;