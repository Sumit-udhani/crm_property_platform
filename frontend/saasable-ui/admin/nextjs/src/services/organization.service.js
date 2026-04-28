import axiosInstance from './axiosInstance'

const organizationService = {
  getOrganizations: async () => {
    const response = await axiosInstance.get('/organizations');
    return response.data;
  },

  createOrganization: async (payload) => {
    const response = await axiosInstance.post('/organizations', payload);
    return response.data;
  },

  editOrganization: async (id, payload) => {
    const response = await axiosInstance.put(`/organizations/${id}`, payload);
    return response.data;
  },
};

export default organizationService;