/**
 * Utilidad institucional para imprimir documentos HTML sin ventanas en blanco.
 * Usa un iframe temporal con Blob URL para garantizar la carga completa de estilos y fuentes.
 */
export function imprimirDocumentoHtml(html: string): void {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  iframe.src = url

  document.body.appendChild(iframe)

  iframe.onload = () => {
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus()
        iframe.contentWindow?.print()
      } catch {
        const win = window.open(url, '_blank')
        win?.focus()
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe)
          }
          URL.revokeObjectURL(url)
        }, 2000)
      }
    }, 300)
  }
}

/**
 * Abre el documento HTML en una pestaña limpia con Blob URL garantizado.
 */
export function abrirDocumentoEnPestana(html: string): void {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const win = window.open(url, '_blank')
  if (win) {
    win.focus()
  }
}
