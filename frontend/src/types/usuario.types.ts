export interface RolResponse {
  id_rol: number
  nombre: string
  descripcion?: string | null
}

export interface UsuarioBase {
  nombre_completo: string
  email: string
  rol_id: number
  activo: boolean
}

export interface UsuarioCreate extends UsuarioBase {
  password: string
}

export interface UsuarioUpdate {
  nombre_completo?: string
  email?: string
  rol_id?: number
  activo?: boolean
  password?: string
}

export interface UsuarioResponse extends UsuarioBase {
  id_usuario: number
  ultimo_acceso?: string | null
  rol?: RolResponse | null
}