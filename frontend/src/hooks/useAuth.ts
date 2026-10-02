/**
 * Hook para acceder al contexto de autenticación.
 * Lanza un error si se usa fuera del AuthProvider.
 */
import { useContext } from 'react'
import { AuthContext } from '@/context/AuthContext'

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}
