<script setup>
import { computed, onMounted, ref } from 'vue'
import { errorMessage } from '@/lib/api'
import { listarEventos } from '@/services/eventos'
import AppLayout from '@/layouts/AppLayout.vue'
import MapaEventos from '@/components/mapa/MapaEventos.vue'
import UiAlert from '@/components/ui/UiAlert.vue'

const eventos = ref([])
const carregando = ref(true)
const erro = ref('')

const totalLocais = computed(() => new Set(eventos.value.map((evento) => evento.local_id)).size)

onMounted(async () => {
  try {
    // O mapa precisa de todos os eventos de uma vez (máximo de 100 por página na API).
    const resposta = await listarEventos({ por_pagina: 100 })
    eventos.value = resposta.data
  } catch (error) {
    erro.value = errorMessage(error, 'Não foi possível carregar os eventos do mapa.')
  } finally {
    carregando.value = false
  }
})
</script>

<template>
  <AppLayout>
    <div class="mb-4">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Mapa de eventos</h1>
      <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
        <template v-if="carregando">Carregando eventos…</template>
        <template v-else>
          {{ eventos.length }} evento(s) em {{ totalLocais }} local(is). Clique em um marcador para
          ver os detalhes.
        </template>
      </p>
    </div>

    <UiAlert v-if="erro" variant="error" class="mb-4">{{ erro }}</UiAlert>

    <MapaEventos :eventos="eventos" altura="70vh" />
  </AppLayout>
</template>
