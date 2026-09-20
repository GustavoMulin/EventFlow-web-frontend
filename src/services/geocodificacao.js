// Busca de endereço (geocodificação) usando a API pública Nominatim, do OpenStreetMap.
// Sem chave de API. Uso leve/manual (uma busca por clique), conforme a política de uso deles.
const URL_NOMINATIM = 'https://nominatim.openstreetmap.org/search'

/**
 * Converte um texto de endereço em até 5 resultados: [{ nome, latitude, longitude }].
 */
export async function buscarEndereco(texto) {
  const consulta = texto.trim()
  if (consulta.length < 3) return []

  const parametros = new URLSearchParams({
    q: consulta,
    format: 'jsonv2',
    limit: '5',
    'accept-language': 'pt-BR',
  })

  const resposta = await fetch(`${URL_NOMINATIM}?${parametros}`)
  if (!resposta.ok) {
    throw new Error('Não foi possível buscar o endereço agora. Tente novamente.')
  }

  const resultados = await resposta.json()
  return resultados.map((item) => ({
    nome: item.display_name,
    latitude: Number(Number(item.lat).toFixed(7)),
    longitude: Number(Number(item.lon).toFixed(7)),
  }))
}
