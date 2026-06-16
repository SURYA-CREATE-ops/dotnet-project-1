import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5220/api'

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jobflow_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jobflow_token')
      localStorage.removeItem('jobflow_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
