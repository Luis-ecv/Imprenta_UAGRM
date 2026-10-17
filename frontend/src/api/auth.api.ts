import apiClient from './client'
import type { LoginRequest, TokenResponse, UsuarioAutenticado } from '@/types'

export const authApi = {
  login: async (credentials: LoginRequest): Promise<TokenResponse> => {
    const { data } = await apiClient.post<TokenResponse>('/auth/login', credentials)
    return data
  },
  getMe: async (): Promise<UsuarioAutenticado> => {
    const { data } = await apiClient.get<UsuarioAutenticado>('/auth/me')
    return data
  },
}