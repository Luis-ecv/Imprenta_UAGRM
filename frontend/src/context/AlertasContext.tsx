import { createContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { insumosApi } from '@/api/insumos.api'
import type { InsumoResponse } from '@/types'
import { useAuth } from '@/hooks/useAuth'

interface AlertasContextType {
  alertas: InsumoResponse[]
  cantidadAlertas: number
  cargando: boolean
  recargarAlertas: () => Promise<void>
}

export const AlertasContext = createContext<AlertasContextType | null>(null)

export function AlertasProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, rol } = useAuth()
  const [alertas, setAlertas] = useState<InsumoResponse[]>([])
  const [cargando, setCargando] = useState<boolean>(false)

  const recargarAlertas = useCallback(async () => {
    // Solo cargamos alertas si está autenticado y no es cliente
    if (!isAuthenticated || rol === 'Cliente') return
    try {
      setCargando(true)
      const data = await insumosApi.obtenerAlertas()
      setAlertas(data)
    } catch {
      // Manejo silencioso en background
    } finally {
      setCargando(false)
    }
  }, [isAuthenticated, rol])

  useEffect(() => {
    if (isAuthenticated && rol !== 'Cliente') {
      recargarAlertas()
    } else {
      setAlertas([])
    }
  }, [isAuthenticated, rol, recargarAlertas])

  return (
    <AlertasContext.Provider
      value={{
        alertas,
        cantidadAlertas: alertas.length,
        cargando,
        recargarAlertas,
      }}
    >
      {children}
    </AlertasContext.Provider>
  )
}