<script setup>
// Mapa (Leaflet + OpenStreetMap) com um marcador por local. Clicar no marcador abre um
// popup com nome, data, preço e o botão "Ver detalhes" de cada evento daquele local.
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import L, { ATRIBUICAO, CENTRO_BRASIL, URL_TILES } from '@/lib/leaflet'
import { formatarData, formatarHora, formatarMoeda } from '@/lib/formatadores'

const props = defineProps({
  eventos: { type: Array, default: () => [] },
  altura: { type: String, default: '70vh' },
})

const router = useRouter()
const container = ref(null)
let mapa = null
let camada = null

// Monta o popup com DOM puro (textContent) para evitar injeção de HTML nos textos.
function montarPopup(local, eventosDoLocal) {
  const raiz = document.createElement('div')
  raiz.className = 'min-w-48 space-y-3 text-sm'

  const titulo = document.createElement('div')
  titulo.className = 'font-semibold text-slate-900'
  titulo.textContent = local.nome
  raiz.appendChild(titulo)

  for (const evento of eventosDoLocal) {
    const bloco = document.createElement('div')
    bloco.className = 'border-t border-slate-200 pt-2'

    const nome = document.createElement('div')
    nome.className = 'font-medium text-slate-800'
    nome.textContent = evento.nome

    const quando = document.createElement('div')
    quando.className = 'text-slate-600'
    quando.textContent = `${formatarData(evento.data_evento)} às ${formatarHora(evento.hora_evento)}`

    const preco = document.createElement('div')
    preco.className = 'text-slate-600'
    preco.textContent = formatarMoeda(evento.preco)

    const botao = document.createElement('button')
    botao.type = 'button'
    botao.className =
      'mt-1 rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-indigo-500'
    botao.textContent = 'Ver detalhes'
    botao.addEventListener('click', () =>
      router.push({ name: 'evento', params: { id: evento.id } }),
    )

    bloco.append(nome, quando, preco, botao)
    raiz.appendChild(bloco)
  }

  return raiz
}

function desenhar() {
  if (!mapa) return
  camada.clearLayers()

  // Agrupa os eventos por local: um marcador por local.
  const porLocal = new Map()
  for (const evento of props.eventos) {
    if (!evento.local) continue
    if (!porLocal.has(evento.local.id)) {
      porLocal.set(evento.local.id, { local: evento.local, eventos: [] })
    }
    porLocal.get(evento.local.id).eventos.push(evento)
  }

  const pontos = []
  for (const { local, eventos } of porLocal.values()) {
    const ponto = [local.latitude, local.longitude]
    pontos.push(ponto)
    L.marker(ponto).bindPopup(montarPopup(local, eventos)).addTo(camada)
  }

  if (pontos.length === 1) {
    mapa.setView(pontos[0], 15)
  } else if (pontos.length > 1) {
    mapa.fitBounds(pontos, { padding: [40, 40] })
  } else {
    mapa.setView(CENTRO_BRASIL, 4)
  }
}

onMounted(() => {
  mapa = L.map(container.value).setView(CENTRO_BRASIL, 4)
  L.tileLayer(URL_TILES, { maxZoom: 19, attribution: ATRIBUICAO }).addTo(mapa)
  camada = L.layerGroup().addTo(mapa)
  desenhar()
  // O contêiner pode ainda não ter o tamanho final quando o mapa é criado.
  setTimeout(() => mapa?.invalidateSize(), 0)
})

watch(() => props.eventos, desenhar, { deep: true })

onBeforeUnmount(() => {
  mapa?.remove()
  mapa = null
})
</script>

<template>
  <div
    ref="container"
    class="relative z-0 w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800"
    :style="{ height: altura }"
  ></div>
</template>
