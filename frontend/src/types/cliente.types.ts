import type { TipoCliente } from './common.types'

export interface ClienteBase {
  razon_social: string
  tipo_cliente: TipoCliente
  nit_ci?: string | null
  telefono?: string | null
  email?: string | null
  contacto_responsable?: string | null
}

export type ClienteCreate = ClienteBase

export type ClienteUpdate = Partial<ClienteBase>

export interface ClienteResponse extends ClienteBase {
  id_cliente: number
  created_at: string
}