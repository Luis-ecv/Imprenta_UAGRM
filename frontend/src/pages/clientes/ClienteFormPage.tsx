import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Check, AlertCircle } from 'lucide-react';
import { clientesApi } from '@/api/clientes.api';
import type { TipoCliente } from '@/types';
import { Button } from '@/components/ui';
import { UAGRM_TOKENS } from '@/theme/tokens';
import { TIPOS_CLIENTE_OPCIONES } from '@/hooks/useClientes';

export function ClienteFormPage() {
  const navigate = useNavigate();

  const [razonSocial, setRazonSocial] = useState('');
  const [tipoCliente, setTipoCliente] = useState<TipoCliente>('facultad');
  const [nitCi, setNitCi] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [contacto, setContacto] = useState('');

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    try {
      setGuardando(true);
      setError(null);
      await clientesApi.crear({
        razon_social: razonSocial,
        tipo_cliente: tipoCliente,
        nit_ci: nitCi || undefined,
        telefono: telefono || undefined,
        email: email || undefined,
        contacto_responsable: contacto || undefined,
      });
      navigate('/clientes');
    } catch {
      setError('Error al registrar el cliente en el sistema.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        to="/clientes"
        className="inline-flex items-center gap-2 text-sm font-bold transition hover:opacity-80"
        style={{ color: UAGRM_TOKENS.colors.ruby }}
      >
        <ArrowLeft size={16} /> Volver a clientes
      </Link>

      <div
        className="rounded-2xl p-6 shadow-sm space-y-5"
        style={{
          backgroundColor: UAGRM_TOKENS.colors.background.paper,
          border: `1px solid ${UAGRM_TOKENS.border.subtle}`,
        }}
      >
        <div
          className="pb-3"
          style={{ borderBottom: `1px solid ${UAGRM_TOKENS.border.subtle}` }}
        >
          <h1
            className="text-2xl font-extrabold flex items-center gap-2"
            style={{ color: UAGRM_TOKENS.colors.primaryDark }}
          >
            <Users size={22} style={{ color: UAGRM_TOKENS.colors.ruby }} />
            Registrar Solicitante / Cliente
          </h1>
          <p
            className="text-xs mt-0.5"
            style={{ color: UAGRM_TOKENS.colors.slate }}
          >
            Alta de facultad, unidad académica o cliente particular.
          </p>
        </div>

        {error && (
          <div
            className="flex items-center gap-3 p-4 rounded-xl text-sm"
            style={{
              backgroundColor: UAGRM_TOKENS.colors.status.error.light,
              borderColor: UAGRM_TOKENS.border.danger,
              borderWidth: 1,
              borderStyle: 'solid',
              color: UAGRM_TOKENS.colors.status.error.dark,
            }}
          >
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-xs font-bold uppercase mb-1"
              style={{ color: UAGRM_TOKENS.colors.charcoal }}
            >
              Razón Social / Nombre de Unidad o Facultad *
            </label>
            <input
              type="text"
              required
              value={razonSocial}
              onChange={(e) => setRazonSocial(e.target.value)}
              placeholder="Ej. Facultad de Ciencias Exactas y Tecnología"
              className="form-input text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="block text-xs font-bold uppercase mb-1"
                style={{ color: UAGRM_TOKENS.colors.charcoal }}
              >
                Tipo de Solicitante *
              </label>
              <select
                value={tipoCliente}
                onChange={(e) => setTipoCliente(e.target.value as TipoCliente)}
                className="form-input text-sm font-semibold"
              >
                {TIPOS_CLIENTE_OPCIONES.map((opt) => (
                  <option key={opt.valor} value={opt.valor}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className="block text-xs font-bold uppercase mb-1"
                style={{ color: UAGRM_TOKENS.colors.charcoal }}
              >
                NIT o Cédula de Identidad
              </label>
              <input
                type="text"
                value={nitCi}
                onChange={(e) => setNitCi(e.target.value)}
                placeholder="Ej. 1028374023"
                className="form-input text-sm font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="block text-xs font-bold uppercase mb-1"
                style={{ color: UAGRM_TOKENS.colors.charcoal }}
              >
                Teléfono / Celular
              </label>
              <input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Ej. 76012345"
                className="form-input text-sm"
              />
            </div>

            <div>
              <label
                className="block text-xs font-bold uppercase mb-1"
                style={{ color: UAGRM_TOKENS.colors.charcoal }}
              >
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contacto@uagrm.edu.bo"
                className="form-input text-sm"
              />
            </div>
          </div>

          <div>
            <label
              className="block text-xs font-bold uppercase mb-1"
              style={{ color: UAGRM_TOKENS.colors.charcoal }}
            >
              Nombre de Contacto / Responsable
            </label>
            <input
              type="text"
              value={contacto}
              onChange={(e) => setContacto(e.target.value)}
              placeholder="Ej. Lic. Carlos Valdivia (Director de Carrera)"
              className="form-input text-sm"
            />
          </div>

          <div className="flex items-center justify-center gap-3 pt-3">
            <Button
              variant="outline"
              component={Link}
              to="/clientes"
              disabled={guardando}
              style={{ minWidth: 125 }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={guardando}
              isLoading={guardando}
              icon={<Check size={18} />}
              style={{ minWidth: 165 }}
            >
              Confirmar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default ClienteFormPage;
