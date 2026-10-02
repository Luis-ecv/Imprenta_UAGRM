/**
 * Instancia de Axios configurada para comunicarse con el backend FastAPI.
 * Gestiona automáticamente el token JWT en los headers.
 */
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

// Variable en memoria para el token (más seguro que localStorage)
let accessToken: string | null = null

export const setAccessToken = (token: string | null): void => {
  accessToken = token
}

export const getAccessToken = (): string | null => accessToken

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Interceptor de request: agrega el JWT al header Authorization
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Interceptor de response: maneja errores 401 (token expirado)
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado: limpiar sesión y redirigir al login
      setAccessToken(null)
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
