import axiosInstance from './axiosInstance'

const authService = {


  login: async (email, password) => {
    const response = await axiosInstance.post('/auth/login', { email, password })
    return response.data
  },

 
logout: async () => {
  const response = await axiosInstance.post('/auth/logout')
  
 
  if (response.data.success) {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    
    document.cookie = `token=; path=/; max-age=0; domain=${window.location.hostname}`
    document.cookie = 'token=; path=/; max-age=0'
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  }

  return response.data
},

forgotPassword: async (email) => {
  const response = await axiosInstance.post('/auth/forgot-password', { email });
  return response.data;
},
setPassword: async (token, password, confirmPassword) => {
    const response = await axiosInstance.post('/auth/set-password', {
      token,
      password,
      confirmPassword
    })
    return response.data
  },
  getMe: async () => {
  const response = await axiosInstance.get('/auth/me')
  return response.data
},
updateMe: async (formData) => {
  const response = await axiosInstance.put('/auth/me', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
},
}

export default authService