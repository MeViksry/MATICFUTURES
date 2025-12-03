import { defineStore } from 'pinia'
import type { User, LoginCredentials, RegisterData } from '~/types'

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false
  }),

  getters: {
    isActive: (state) => state.user?.isActive ?? false,
    isPremium: (state) => {
      return state.user?.subscription?.plan !== 'free' && 
             state.user?.subscription?.status === 'active'
    }
  },

  actions: {
    async login(credentials: LoginCredentials) {
      this.isLoading = true
      try {
        const response = await fetch(`${useRuntimeConfig().public.apiBaseUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials)
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Login failed')
        }

        this.setAuth(data.data)
        return data
      } finally {
        this.isLoading = false
      }
    },

    async register(userData: RegisterData) {
      this.isLoading = true
      try {
        const response = await fetch(`${useRuntimeConfig().public.apiBaseUrl}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Registration failed')
        }

        return data
      } finally {
        this.isLoading = false
      }
    },

    async verifyEmail(code: string) {
      const response = await fetch(`${useRuntimeConfig().public.apiBaseUrl}/api/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({ code })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed')
      }

      if (this.user) {
        this.user.isEmailVerified = true
      }

      return data
    },

    async forgotPassword(email: string) {
      const response = await fetch(`${useRuntimeConfig().public.apiBaseUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Request failed')
      }

      return data
    },

    async resetPassword(token: string, password: string) {
      const response = await fetch(`${useRuntimeConfig().public.apiBaseUrl}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Reset failed')
      }

      return data
    },

    async refreshAccessToken() {
      if (!this.refreshToken) {
        this.logout()
        return
      }

      try {
        const response = await fetch(`${useRuntimeConfig().public.apiBaseUrl}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: this.refreshToken })
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message)
        }

        this.token = data.data.accessToken
        this.refreshToken = data.data.refreshToken
        
        if (process.client) {
          localStorage.setItem('token', data.data.accessToken)
          localStorage.setItem('refreshToken', data.data.refreshToken)
        }
      } catch {
        this.logout()
      }
    },

    async getProfile() {
      if (!this.token) return

      try {
        const response = await fetch(`${useRuntimeConfig().public.apiBaseUrl}/api/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        })

        const data = await response.json()

        if (response.ok) {
          this.user = data.data
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      }
    },

    setAuth(authData: { user: User; accessToken: string; refreshToken: string }) {
      this.user = authData.user
      this.token = authData.accessToken
      this.refreshToken = authData.refreshToken
      this.isAuthenticated = true

      if (process.client) {
        localStorage.setItem('token', authData.accessToken)
        localStorage.setItem('refreshToken', authData.refreshToken)
        localStorage.setItem('user', JSON.stringify(authData.user))
      }
    },

    loadFromStorage() {
      if (process.client) {
        const token = localStorage.getItem('token')
        const refreshToken = localStorage.getItem('refreshToken')
        const user = localStorage.getItem('user')

        if (token && refreshToken && user) {
          this.token = token
          this.refreshToken = refreshToken
          this.user = JSON.parse(user)
          this.isAuthenticated = true
        }
      }
    },

    logout() {
      this.user = null
      this.token = null
      this.refreshToken = null
      this.isAuthenticated = false

      if (process.client) {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
      }

      navigateTo('/auth/login')
    }
  }
})