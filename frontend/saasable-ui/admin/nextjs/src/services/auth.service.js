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
  
  if (response.success) {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    document.cookie = 'token=; path=/; max-age=0'
  }

  return response.data
}

}

export default authService