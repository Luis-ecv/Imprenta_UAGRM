import type { UsuarioAutenticado } from './common.types'

export interface LoginRequest {
  email: string
  password: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  expira_en_minutos: number
}

export type { UsuarioAutenticado }