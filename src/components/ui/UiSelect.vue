<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, default: '' },
  modelValue: { type: [String, Number], default: '' },
  // [{ value: 1, label: 'Texto' }]
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'Selecione…' },
  error: { type: String, default: '' },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

// v-model no <select> mantém a opção marcada correta mesmo quando a lista chega depois (assíncrona).
const valor = computed({
  get: () => props.modelValue,
  set: (novo) => emit('update:modelValue', novo),
})
</script>

<template>
  <label class="block">
    <span v-if="label" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
      {{ label }}
    </span>
    <select
      v-model="valor"
      :required="required"
      :disabled="disabled"
      class="block w-full rounded-md border-0 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700"
      :class="error ? 'ring-red-500 focus:ring-red-500' : ''"
    >
      <option value="">{{ placeholder }}</option>
      <option v-for="opcao in options" :key="opcao.value" :value="opcao.value">
        {{ opcao.label }}
      </option>
    </select>
    <span v-if="error" class="mt-1 block text-sm text-red-600 dark:text-red-400">{{ error }}</span>
  </label>
</template>
