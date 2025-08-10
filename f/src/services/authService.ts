import { apiClient } from './apiClient'

interface LoginRequest {
  email: string
  password: string
}

interface RegisterRequest {
  email: string
  password: string
  name?: string
}

interface AuthResponse {
  success: boolean
  data: {
    user: {
      id: string
      email: string
      name?: string
      subscriptionTier: string
      voiceMinutesUsed: number
    }
    token: string
    expiresIn: string
  }
}

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', { email, password })
    return response.data
  },

  register: async (email: string, password: string, name?: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', { email, password, name })
    return response.data
  },

  refreshToken: async (token: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/refresh', { token })
    return response.data
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout')
  },

  verifyToken: async (): Promise<{ user: any }> => {
    const response = await apiClient.get('/auth/verify')
    return response.data
  }
}
