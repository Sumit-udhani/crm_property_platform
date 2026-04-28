import axiosInstance from './axiosInstance';

const projectService = {
  getProjects: async (params = {}) => {
    const res = await axiosInstance.get('/projects', { params });
    return res.data;
  },

  getAvailableProjects: async (branchId) => {
    const res = await axiosInstance.get(`/projects/available?branch_id=${branchId}`);
    return res.data;
  },

  getProjectStatuses: async () => {
    const res = await axiosInstance.get('/project-statuses');
    return res.data;
  },

  createProject: async (data) => {
    const res = await axiosInstance.post('/projects', data);
    return res.data;
  },

  editProject: async (id, data) => {
    const res = await axiosInstance.put(`/projects/${id}`, data);
    return res.data;
  },
};

export default projectService;
