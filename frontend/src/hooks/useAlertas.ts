import { useContext } from 'react'
import { AlertasContext } from '@/context/AlertasContext'

export function useAlertas() {
  const context = useContext(AlertasContext)
  if (!context) {
    throw new Error('useAlertas debe usarse dentro de un AlertasProvider')
  }
  return context
}