// Formatação de datas (pt-BR) e geração de IDs/horários da demonstração.
export function formatarDataHora(iso) {
  const d = new Date(iso)
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function formatarHora(iso) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export function agoraISO() {
  return new Date().toISOString()
}

export function proximoId(prefixo, lista, digitos = 4) {
  const maior = lista.reduce((max, item) => {
    const n = parseInt(String(item.id).replace(/\D/g, ''), 10)
    return Number.isNaN(n) ? max : Math.max(max, n)
  }, 0)
  return `${prefixo}${String(maior + 1).padStart(digitos, '0')}`
}
