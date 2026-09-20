const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

/** 0 vira "Gratuito"; demais valores em reais (R$ 49,90). */
export function formatarMoeda(valor) {
  const numero = Number(valor)
  return numero > 0 ? moeda.format(numero) : 'Gratuito'
}

/** "2026-09-29" -> "29/09/2026" (sem passar por Date, para não sofrer com fuso horário). */
export function formatarData(iso) {
  if (!iso) return ''
  const [ano, mes, dia] = iso.slice(0, 10).split('-')
  return `${dia}/${mes}/${ano}`
}

/** "19:30:00" -> "19:30" */
export function formatarHora(hora) {
  return hora ? hora.slice(0, 5) : ''
}

/** ISO 8601 completo -> "29/09/2026 19:30" no fuso do navegador. */
export function formatarDataHora(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}
