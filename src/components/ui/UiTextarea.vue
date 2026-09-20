<script setup>
defineProps({
  label: { type: String, default: '' },
  modelValue: { type: String, default: '' },
  rows: { type: Number, default: 5 },
  error: { type: String, default: '' },
  required: { type: Boolean, default: false },
  placeholder: { type: String, default: '' },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <label class="block">
    <span v-if="label" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
      {{ label }}
    </span>
    <textarea
      :value="modelValue"
      :rows="rows"
      :required="required"
      :placeholder="placeholder"
      class="block w-full rounded-md border-0 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700"
      :class="error ? 'ring-red-500 focus:ring-red-500' : ''"
      @input="$emit('update:modelValue', $event.target.value)"
    ></textarea>
    <span v-if="error" class="mt-1 block text-sm text-red-600 dark:text-red-400">{{ error }}</span>
  </label>
</template>
