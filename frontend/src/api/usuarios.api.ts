import apiClient from './client'
import type {
  UsuarioResponse,
  UsuarioCreate,
  UsuarioUpdate,
  RolResponse,
  RespuestaPaginada,
  RespuestaExito,
  ParametrosPaginacion
} from '@/types'

export const usuariosApi = {
  listar: async (params?: ParametrosPaginacion): Promise<RespuestaPaginada<UsuarioResponse>> => {
    const { data } = await apiClient.get<RespuestaPaginada<UsuarioResponse>>('/usuarios', { params })
    return data
  },
  obtener: async (id: number): Promise<UsuarioResponse> => {
    const { data } = await apiClient.get<UsuarioResponse>(`/usuarios/${id}`)
    return data
  },
  crear: async (payload: UsuarioCreate): Promise<UsuarioResponse> => {
    const { data } = await apiClient.post<UsuarioResponse>('/usuarios', payload)
    return data
  },
  actualizar: async (id: number, payload: UsuarioUpdate): Promise<UsuarioResponse> => {
    const { data } = await apiClient.put<UsuarioResponse>(`/usuarios/${id}`, payload)
    return data
  },
  eliminar: async (id: number): Promise<RespuestaExito> => {
    const { data } = await apiClient.delete<RespuestaExito>(`/usuarios/${id}`)
    return data
  },
  listarRoles: async (): Promise<RolResponse[]> => {
       const { data } = await apiClient.get<RolResponse[]>('/usuarios/roles')
    return data
    // return [
    //   { id_rol: 1, nombre: 'Superadministrador', descripcion: 'Acceso total y auditoría institucional' },
    //   { id_rol: 2, nombre: 'Administrador', descripcion: 'Jefe de imprenta y supervisión general' },
    //   { id_rol: 3, nombre: 'Operador Mostrador', descripcion: 'Atención al cliente, cotizaciones y pedidos' },
    //   { id_rol: 4, nombre: 'Operador Taller', descripcion: 'Producción gráfica, prensas y acabados' },
    //   { id_rol: 5, nombre: 'Cliente', descripcion: 'Delegado facultativo o solicitante' },
    // ]
  },
}