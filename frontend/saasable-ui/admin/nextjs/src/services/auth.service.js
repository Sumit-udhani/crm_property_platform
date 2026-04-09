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
  
  // ✅ response.data.success not response.success
  if (response.data.success) {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    // Clear cookie with domain
    document.cookie = `token=; path=/; max-age=0; domain=${window.location.hostname}`
    document.cookie = 'token=; path=/; max-age=0'
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  }

  return response.data
}

}

export default authService