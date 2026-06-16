import api from './api'

interface RegisterRequest {
  name: string
  email: string
  password: string
}

interface LoginRequest {
  email: string
  password: string
}

interface AuthResponse {
  id?: string
  name?: string
  email?: string
  createdAt?: string
  token?: string
}

interface LoginResponse {
  token: string
}

interface ProfileResponse {
  id: string
  name: string
  email: string
  createdAt: string
}

const TOKEN_KEY = 'jobflow_token'
const USER_KEY = 'jobflow_user'

export const authService = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data)
    return response.data
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    // Step 1: Login and get JWT token
    const loginResponse = await api.post<LoginResponse>('/auth/login', data)
    const token = loginResponse.data.token

    if (token) {
      // Step 2: Store token first
      localStorage.setItem(TOKEN_KEY, token)

      // Step 3: Fetch user profile using the token
      try {
        const profileResponse = await api.get<ProfileResponse>('/auth/profile')
        const userProfile = profileResponse.data

        // Step 4: Store user data
        localStorage.setItem(
          USER_KEY,
          JSON.stringify({
            id: userProfile.id,
            name: userProfile.name,
            email: userProfile.email,
            createdAt: userProfile.createdAt
          })
        )

        return {
          token,
          ...userProfile
        }
      } catch {
        // If profile fetch fails, still allow login but with minimal user data
        localStorage.setItem(USER_KEY, JSON.stringify({ email: data.email }))
        return { token, email: data.email }
      }
    }

    return loginResponse.data
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },

  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY)
  },

  getUser: (): AuthResponse | null => {
    const user = localStorage.getItem(USER_KEY)
    return user ? JSON.parse(user) : null
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(TOKEN_KEY)
  }
}
