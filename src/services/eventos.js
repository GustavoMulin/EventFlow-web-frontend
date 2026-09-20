import api from '@/lib/api'

/** Lista paginada. Retorna { data: [...], links, meta }. Filtros: busca, categoria_id, local_id, page, por_pagina. */
export async function listarEventos(params = {}) {
  const { data } = await api.get('/eventos', { params })
  return data
}

export async function buscarEvento(id) {
  const { data } = await api.get(`/eventos/${id}`)
  return data.data
}

/** Recebe um FormData (multipart) porque o evento pode levar o arquivo do banner. */
export async function criarEvento(formData) {
  const { data } = await api.post('/eventos', formData)
  return data.data
}

/**
 * Multipart não funciona com PUT no PHP, então enviamos POST + `_method=PUT`
 * (o Laravel trata como PUT).
 */
export async function atualizarEvento(id, formData) {
  formData.append('_method', 'PUT')
  const { data } = await api.post(`/eventos/${id}`, formData)
  return data.data
}

export async function excluirEvento(id) {
  await api.delete(`/eventos/${id}`)
}
