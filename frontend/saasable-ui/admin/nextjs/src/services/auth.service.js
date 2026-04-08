import axiosInstance from './axiosInstance'

const authService = {

  // ─── Login ───
  login: async (email, password) => {
    const response = await axiosInstance.post('/auth/login', { email, password })
    return response.data
  },

  // ─── Logout ───
  logout: async () => {
    const response = await axiosInstance.post('/auth/logout')
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    return response.data
  },

}

export default authService