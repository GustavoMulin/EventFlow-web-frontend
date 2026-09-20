import api from '@/lib/api'

export async function listarLocais() {
  const { data } = await api.get('/locais')
  return data.data
}

export async function criarLocal(dados) {
  const { data } = await api.post('/locais', dados)
  return data.data
}

export async function atualizarLocal(id, dados) {
  const { data } = await api.put(`/locais/${id}`, dados)
  return data.data
}

export async function excluirLocal(id) {
  await api.delete(`/locais/${id}`)
}
