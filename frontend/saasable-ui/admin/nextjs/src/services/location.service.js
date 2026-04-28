import axiosInstance from './axiosInstance';

const locationService = {
  getCountries: async () => {
    const res = await axiosInstance.get('/locations/countries');
    return res.data;
  },

    getStates: async (countryId) => {
    const res = await axiosInstance.get(`/locations/states/${countryId}`);
    return res.data;
  },

  getCities: async (stateId) => {
    const res = await axiosInstance.get(`/locations/cities/${stateId}`);
    return res.data;
  },
};

export default locationService;