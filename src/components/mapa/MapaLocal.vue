<script setup>
// Mapa para escolher a posição de um local: clique no mapa ou arraste o marcador.
// Emite `escolher` com { latitude, longitude } (7 casas decimais).
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L, { ATRIBUICAO, CENTRO_BRASIL, URL_TILES } from '@/lib/leaflet'

const props = defineProps({
  latitude: { type: [Number, String], default: '' },
  longitude: { type: [Number, String], default: '' },
  altura: { type: String, default: '320px' },
})

const emit = defineEmits(['escolher'])

const container = ref(null)
let mapa = null
let marcador = null

const arredondar = (valor) => Number(valor.toFixed(7))

function coordenadasValidas() {
  const lat = parseFloat(props.latitude)
  const lng = parseFloat(props.longitude)
  return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null
}

function posicionar(ponto) {
  if (!marcador) {
    marcador = L.marker(ponto, { draggable: true }).addTo(mapa)
    marcador.on('dragend', () => {
      const { lat, lng } = marcador.getLatLng()
      emit('escolher', { latitude: arredondar(lat), longitude: arredondar(lng) })
    })
    mapa.setView(ponto, 15)
    return
  }

  marcador.setLatLng(ponto)
  // Só recentraliza se o ponto saiu da área visível (ex.: veio de uma busca de endereço).
  if (!mapa.getBounds().contains(ponto)) mapa.setView(ponto, 15)
}

onMounted(() => {
  mapa = L.map(container.value).setView(CENTRO_BRASIL, 4)
  L.tileLayer(URL_TILES, { maxZoom: 19, attribution: ATRIBUICAO }).addTo(mapa)

  mapa.on('click', (evento) => {
    emit('escolher', {
      latitude: arredondar(evento.latlng.lat),
      longitude: arredondar(evento.latlng.lng),
    })
  })

  const inicial = coordenadasValidas()
  if (inicial) posicionar(inicial)
  setTimeout(() => mapa?.invalidateSize(), 0)
})

watch(
  () => [props.latitude, props.longitude],
  () => {
    const ponto = coordenadasValidas()
    if (ponto && mapa) posicionar(ponto)
  },
)

onBeforeUnmount(() => {
  mapa?.remove()
  mapa = null
  marcador = null
})
</script>

<template>
  <div>
    <div
      ref="container"
      class="relative z-0 w-full overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700"
      :style="{ height: altura }"
    ></div>
    <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
      Clique no mapa ou arraste o marcador para ajustar a posição.
    </p>
  </div>
</template>
