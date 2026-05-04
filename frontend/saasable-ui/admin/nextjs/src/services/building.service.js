import axiosInstance from './axiosInstance';

const buildingService = {
  getBuildings: async () => {
    const response = await axiosInstance.get('/buildings');
    return response.data;
  },

  getBuildingTypes: async () => {
    const response = await axiosInstance.get('/buildings/types');
    return response.data;
  },

  createBuilding: async (payload) => {
    const response = await axiosInstance.post('/buildings', payload);
    return response.data;
  },

  updateBuilding: async (id, payload) => {
    const response = await axiosInstance.put(`/buildings/${id}`, payload);
    return response.data;
  },

  deleteBuilding: async (id) => {
    const response = await axiosInstance.delete(`/buildings/${id}`);
    return response.data;
  },
};

export default buildingService;
