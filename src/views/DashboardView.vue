<script setup>
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/layouts/AppLayout.vue'
import UiCard from '@/components/ui/UiCard.vue'

const auth = useAuthStore()
</script>

<template>
  <AppLayout>
    <h1 class="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>

    <div class="grid gap-4 sm:grid-cols-2">
      <UiCard title="Account">
        <dl class="space-y-2 text-sm">
          <div class="flex justify-between">
            <dt class="text-slate-500 dark:text-slate-400">Name</dt>
            <dd class="font-medium">{{ auth.user?.name }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-slate-500 dark:text-slate-400">E-mail</dt>
            <dd class="font-medium">{{ auth.user?.email }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-slate-500 dark:text-slate-400">E-mail verified</dt>
            <dd class="font-medium">{{ auth.emailVerified ? 'Yes' : 'No' }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-slate-500 dark:text-slate-400">Two-factor auth</dt>
            <dd class="font-medium">{{ auth.twoFactorEnabled ? 'Enabled' : 'Disabled' }}</dd>
          </div>
        </dl>
      </UiCard>

      <UiCard
        title="Next steps"
        subtitle="This is the baseline shell — build EventFlow features here."
      >
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Auth, account settings and two-factor are wired to the API. Add your domain screens as new
          routes under a
          <code class="rounded bg-slate-100 px-1 dark:bg-slate-800">requiresAuth</code>
          meta.
        </p>
      </UiCard>
    </div>
  </AppLayout>
</template>
