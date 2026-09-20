<script setup>
// Janela de confirmação (ex.: "Excluir este evento?").
import UiButton from '@/components/ui/UiButton.vue'

defineProps({
  aberto: { type: Boolean, default: false },
  titulo: { type: String, default: 'Confirmar' },
  confirmarTexto: { type: String, default: 'Confirmar' },
  variante: { type: String, default: 'danger' },
  carregando: { type: Boolean, default: false },
})

defineEmits(['confirmar', 'cancelar'])
</script>

<template>
  <Teleport to="body">
    <div
      v-if="aberto"
      class="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/60 px-4"
      role="dialog"
      aria-modal="true"
      @click.self="$emit('cancelar')"
    >
      <div
        class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900 dark:text-slate-100"
      >
        <h2 class="text-lg font-semibold">{{ titulo }}</h2>
        <div class="mt-2 text-sm text-slate-600 dark:text-slate-300">
          <slot />
        </div>
        <div class="mt-6 flex justify-end gap-2">
          <UiButton variant="secondary" :disabled="carregando" @click="$emit('cancelar')">
            Cancelar
          </UiButton>
          <UiButton :variant="variante" :loading="carregando" @click="$emit('confirmar')">
            {{ confirmarTexto }}
          </UiButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>
