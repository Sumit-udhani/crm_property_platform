import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)


axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status

    
    if (status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('userId')
       document.cookie = 'token=; Max-Age=0; path=/';
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

export default axiosInstance