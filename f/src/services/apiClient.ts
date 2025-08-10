import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v2'

console.log('API Base URL:', API_BASE_URL)

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000
})

// Request interceptor for auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  console.log('Making API request to:', config.url)
  return config
})

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('API response:', response.data)
    return response
  },
  (error) => {
    console.error('API error:', error)
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      // Не редиректим на login для демо
    }
    return Promise.reject(error)
  }
)
