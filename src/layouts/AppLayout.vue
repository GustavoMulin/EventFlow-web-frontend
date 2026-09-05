<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import UiAlert from '@/components/ui/UiAlert.vue'

const auth = useAuthStore()
const router = useRouter()

const nav = [
  { name: 'Dashboard', to: { name: 'dashboard' } },
  { name: 'Profile', to: { name: 'settings.profile' } },
  { name: 'Security', to: { name: 'settings.security' } },
]

async function logout() {
  await auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="min-h-screen">
    <header class="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div class="flex items-center gap-6">
          <span class="text-lg font-bold text-slate-900 dark:text-slate-100">EventFlow</span>
          <nav class="flex items-center gap-1">
            <RouterLink
              v-for="item in nav"
              :key="item.name"
              :to="item.to"
              class="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              active-class="bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
            >
              {{ item.name }}
            </RouterLink>
          </nav>
        </div>
        <div class="flex items-center gap-3">
          <span class="hidden text-sm text-slate-500 sm:inline dark:text-slate-400">
            {{ auth.user?.email }}
          </span>
          <button
            class="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            @click="logout"
          >
            Log out
          </button>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-5xl px-4 py-8">
      <UiAlert v-if="auth.user && !auth.emailVerified" variant="info" class="mb-6">
        Your e-mail address is not verified.
        <RouterLink :to="{ name: 'settings.profile' }" class="font-semibold underline">
          Resend verification
        </RouterLink>
      </UiAlert>
      <slot />
    </main>
  </div>
</template>
