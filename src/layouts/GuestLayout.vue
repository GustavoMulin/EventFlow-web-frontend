<script setup>
defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <div class="mb-6 text-center">
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          EventFlow
        </h1>
        <p v-if="title" class="mt-2 text-lg font-semibold text-slate-700 dark:text-slate-300">
          {{ title }}
        </p>
        <p v-if="subtitle" class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {{ subtitle }}
        </p>
      </div>
      <div
        class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <slot />
      </div>
      <div class="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>
