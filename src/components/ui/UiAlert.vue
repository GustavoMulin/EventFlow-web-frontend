<script setup>
defineProps({
  variant: { type: String, default: 'info' },
})

const variants = {
  info: 'bg-indigo-50 text-indigo-800 ring-indigo-200 dark:bg-indigo-950 dark:text-indigo-200 dark:ring-indigo-900',
  success:
    'bg-green-50 text-green-800 ring-green-200 dark:bg-green-950 dark:text-green-200 dark:ring-green-900',
  error: 'bg-red-50 text-red-800 ring-red-200 dark:bg-red-950 dark:text-red-200 dark:ring-red-900',
}
</script>

<template>
  <div class="rounded-md px-3 py-2 text-sm ring-1 ring-inset" :class="variants[variant]">
    <slot />
  </div>
</template>
