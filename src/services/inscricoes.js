import api from '@/lib/api'

/** Inscrição pública de um participante. Retorna a inscrição criada (com o `codigo` do ingresso). */
export async function criarInscricao(eventoId, dados) {
  const { data } = await api.post(`/eventos/${eventoId}/inscricoes`, dados)
  return data.data
}

/** Participantes inscritos (área autenticada). */
export async function listarInscricoes(eventoId) {
  const { data } = await api.get(`/eventos/${eventoId}/inscricoes`)
  return data.data
}

export async function cancelarInscricao(codigo) {
  await api.delete(`/inscricoes/${codigo}`)
}

/** Baixa o ingresso em PDF: pede o arquivo como blob e dispara o download no navegador. */
export async function baixarIngresso(inscricao) {
  const resposta = await api.get(`/inscricoes/${inscricao.codigo}/ingresso`, {
    responseType: 'blob',
  })

  const url = URL.createObjectURL(resposta.data)
  const link = document.createElement('a')
  link.href = url
  link.download = `ingresso-${inscricao.codigo.slice(0, 8)}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
