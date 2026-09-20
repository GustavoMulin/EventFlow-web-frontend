<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { errorMessage } from '@/lib/api'
import { listarEventos } from '@/services/eventos'
import { listarCategorias } from '@/services/categorias'
import AppLayout from '@/layouts/AppLayout.vue'
import EventoCard from '@/components/eventos/EventoCard.vue'
import UiField from '@/components/ui/UiField.vue'
import UiSelect from '@/components/ui/UiSelect.vue'
import UiAlert from '@/components/ui/UiAlert.vue'
import UiPagination from '@/components/ui/UiPagination.vue'

const auth = useAuthStore()

const eventos = ref([])
const meta = ref({ current_page: 1, last_page: 1, total: 0 })
const categorias = ref([])
const busca = ref('')
const categoriaId = ref('')
const pagina = ref(1)
const carregando = ref(false)
const erro = ref('')
let temporizador = null

async function carregar() {
  carregando.value = true
  erro.value = ''
  try {
    const resposta = await listarEventos({
      busca: busca.value || undefined,
      categoria_id: categoriaId.value || undefined,
      page: pagina.value,
    })
    eventos.value = resposta.data
    meta.value = resposta.meta
  } catch (error) {
    erro.value = errorMessage(error, 'Não foi possível carregar os eventos.')
  } finally {
    carregando.value = false
  }
}

// Busca com "debounce": só consulta a API 400 ms depois de parar de digitar.
watch(busca, () => {
  clearTimeout(temporizador)
  temporizador = setTimeout(() => {
    pagina.value = 1
    carregar()
  }, 400)
})

watch(categoriaId, () => {
  pagina.value = 1
  carregar()
})

function mudarPagina(nova) {
  pagina.value = nova
  carregar()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(async () => {
  try {
    categorias.value = await listarCategorias()
  } catch {
    // sem as categorias o filtro apenas fica vazio; a lista de eventos continua funcionando
  }
  carregar()
})

onBeforeUnmount(() => clearTimeout(temporizador))
</script>

<template>
  <AppLayout>
    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Eventos</h1>
      <RouterLink
        v-if="auth.isAuthenticated"
        :to="{ name: 'evento.novo' }"
        class="rounded-md bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
      >
        Novo evento
      </RouterLink>
    </div>

    <div class="mb-6 grid gap-3 sm:grid-cols-[1fr_16rem]">
      <UiField v-model="busca" placeholder="Buscar por nome ou descrição…" />
      <UiSelect
        v-model="categoriaId"
        placeholder="Todas as categorias"
        :options="categorias.map((categoria) => ({ value: categoria.id, label: categoria.nome }))"
      />
    </div>

    <UiAlert v-if="erro" variant="error" class="mb-6">{{ erro }}</UiAlert>

    <p v-if="carregando && !eventos.length" class="text-sm text-slate-500">Carregando eventos…</p>

    <p
      v-else-if="!carregando && !eventos.length && !erro"
      class="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700"
    >
      Nenhum evento encontrado.
    </p>

    <div
      v-else
      class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      :class="{ 'opacity-60': carregando }"
    >
      <EventoCard v-for="evento in eventos" :key="evento.id" :evento="evento" />
    </div>

    <div class="mt-8">
      <UiPagination
        :pagina="meta.current_page"
        :ultima-pagina="meta.last_page"
        @mudar="mudarPagina"
      />
    </div>
  </AppLayout>
</template>
