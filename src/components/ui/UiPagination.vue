<script setup>
defineProps({
  pagina: { type: Number, default: 1 },
  ultimaPagina: { type: Number, default: 1 },
})

defineEmits(['mudar'])
</script>

<template>
  <nav
    v-if="ultimaPagina > 1"
    class="flex items-center justify-between gap-3 text-sm"
    aria-label="Paginação"
  >
    <button
      type="button"
      class="rounded-md px-3 py-1.5 font-medium text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-800"
      :disabled="pagina <= 1"
      @click="$emit('mudar', pagina - 1)"
    >
      Anterior
    </button>
    <span class="text-slate-500 dark:text-slate-400"
      >Página {{ pagina }} de {{ ultimaPagina }}</span
    >
    <button
      type="button"
      class="rounded-md px-3 py-1.5 font-medium text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-800"
      :disabled="pagina >= ultimaPagina"
      @click="$emit('mudar', pagina + 1)"
    >
      Próxima
    </button>
  </nav>
</template>
