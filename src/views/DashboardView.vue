<script setup>
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/layouts/AppLayout.vue'
import UiCard from '@/components/ui/UiCard.vue'

const auth = useAuthStore()
</script>

<template>
  <AppLayout>
    <h1 class="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">Início</h1>

    <UiCard title="Conta" class="max-w-md">
      <dl class="space-y-2 text-sm">
        <div class="flex justify-between">
          <dt class="text-slate-500 dark:text-slate-400">Nome</dt>
          <dd class="font-medium">{{ auth.user?.name }}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-slate-500 dark:text-slate-400">E-mail</dt>
          <dd class="font-medium">{{ auth.user?.email }}</dd>
        </div>
      </dl>
    </UiCard>
  </AppLayout>
</template>
