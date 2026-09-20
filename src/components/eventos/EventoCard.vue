<script setup>
import { RouterLink } from 'vue-router'
import { formatarData, formatarHora, formatarMoeda } from '@/lib/formatadores'

defineProps({
  evento: { type: Object, required: true },
})
</script>

<template>
  <RouterLink
    :to="{ name: 'evento', params: { id: evento.id } }"
    class="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
  >
    <!-- Miniatura (banner) -->
    <div class="aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
      <img
        v-if="evento.banner_url"
        :src="evento.banner_url"
        :alt="`Banner de ${evento.nome}`"
        class="h-full w-full object-cover transition group-hover:scale-105"
        loading="lazy"
      />
      <div
        v-else
        class="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600 text-white"
      >
        <svg
          class="size-12 opacity-80"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          aria-hidden="true"
        >
          <rect x="3" y="4.5" width="18" height="16" rx="2" />
          <path d="M8 2.5v4M16 2.5v4M3 9.5h18" stroke-linecap="round" />
        </svg>
      </div>
    </div>

    <div class="flex flex-1 flex-col gap-2 p-4">
      <span
        v-if="evento.categoria"
        class="w-fit rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
      >
        {{ evento.categoria.nome }}
      </span>

      <h3 class="line-clamp-2 font-semibold text-slate-900 dark:text-slate-100">
        {{ evento.nome }}
      </h3>

      <p class="text-sm text-slate-600 dark:text-slate-400">
        {{ formatarData(evento.data_evento) }} às {{ formatarHora(evento.hora_evento) }}
      </p>
      <p v-if="evento.local" class="line-clamp-1 text-sm text-slate-500 dark:text-slate-400">
        {{ evento.local.nome }}
      </p>

      <div class="mt-auto flex items-center justify-between pt-2 text-sm">
        <span class="font-semibold text-slate-900 dark:text-slate-100">
          {{ formatarMoeda(evento.preco) }}
        </span>
        <span
          class="text-xs"
          :class="
            evento.vagas_restantes > 0
              ? 'text-slate-500 dark:text-slate-400'
              : 'font-semibold text-red-600 dark:text-red-400'
          "
        >
          {{ evento.vagas_restantes > 0 ? `${evento.vagas_restantes} vagas` : 'Esgotado' }}
        </span>
      </div>
    </div>
  </RouterLink>
</template>
