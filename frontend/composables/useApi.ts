import type { ApiResponse } from '~/types'
import { useAuthStore } from "~/stores/auth";
import { navigateTo } from '#app'

export const useApi = () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  const baseURL = config.public.apiBaseUrl

  const request = async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }

    if (authStore.token) {
      headers['Authorization'] = `Bearer ${authStore.token}`
    }

    try {
      const response = await fetch(`${baseURL}${endpoint}`, {
        ...options,
        headers
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          authStore.logout()
          navigateTo('/auth/login')
        }
        throw new Error(data.message || 'Request failed')
      }

      return data
    } catch (error: any) {
      console.error('API Error:', error)
      throw error
    }
  }

  const get = <T>(endpoint: string, params?: Record<string, any>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : ''
    return request<T>(`${endpoint}${query}`, { method: 'GET' })
  }

  const post = <T>(endpoint: string, body?: any) => {
    return request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    })
  }

  const put = <T>(endpoint: string, body?: any) => {
    return request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    })
  }

  const patch = <T>(endpoint: string, body?: any) => {
    return request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body)
    })
  }

  const del = <T>(endpoint: string) => {
    return request<T>(endpoint, { method: 'DELETE' })
  }

  return { get, post, put, patch, del, request }
}