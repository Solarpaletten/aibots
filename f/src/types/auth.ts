export interface User {
  id: string
  email: string
  name?: string
  subscriptionTier: 'FREE' | 'PREMIUM' | 'BUSINESS'
  voiceMinutesUsed: number
  apiKeysUsed: number
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  success: boolean
  data: {
    user: User
    token: string
    expiresIn: string
  }
  message?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name?: string
}
