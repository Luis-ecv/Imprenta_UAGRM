import { createContext, useState, useCallback, ReactNode } from 'react'
import { setAccessToken } from '@/api/client'
import type { UsuarioAutenticado, RolSistema } from '@/types'

interface AuthContextType {
  usuario: UsuarioAutenticado | null
  isAuthenticated: boolean
  rol: RolSistema | null
  login: (token: string, usuario: UsuarioAutenticado) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null)

  const login = useCallback((token: string, userData: UsuarioAutenticado) => {
    setAccessToken(token)
    setUsuario(userData)
  }, [])

  const logout = useCallback(() => {
    setAccessToken(null)
    setUsuario(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        usuario,
        isAuthenticated: !!usuario,
        rol: usuario?.rol ?? null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}