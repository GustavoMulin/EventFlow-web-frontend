<script setup>
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>

<template>
  <div
    v-if="!auth.ready"
    class="flex min-h-screen items-center justify-center text-sm text-slate-500"
  >
    Carregando…
  </div>
  <RouterView v-else />
</template>
