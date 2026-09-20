<script setup>
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

// Eventos e Mapa são públicos; o restante exige login.
const menu = computed(() => {
  const itens = [
    { nome: 'Eventos', to: { name: 'eventos' } },
    { nome: 'Mapa', to: { name: 'mapa' } },
  ]
  if (auth.isAuthenticated) {
    itens.push(
      { nome: 'Categorias', to: { name: 'categorias' } },
      { nome: 'Locais', to: { name: 'locais' } },
      { nome: 'Perfil', to: { name: 'perfil' } },
    )
  }
  return itens
})

async function sair() {
  await auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="min-h-screen">
    <header class="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div class="flex flex-wrap items-center gap-x-6 gap-y-2">
          <RouterLink
            :to="{ name: 'eventos' }"
            class="text-lg font-bold text-slate-900 dark:text-slate-100"
          >
            EventFlow
          </RouterLink>
          <nav class="flex flex-wrap items-center gap-1">
            <RouterLink
              v-for="item in menu"
              :key="item.nome"
              :to="item.to"
              class="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              active-class="bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
            >
              {{ item.nome }}
            </RouterLink>
          </nav>
        </div>

        <div v-if="auth.isAuthenticated" class="flex items-center gap-3">
          <span class="hidden text-sm text-slate-500 md:inline dark:text-slate-400">
            {{ auth.user?.email }}
          </span>
          <button
            type="button"
            class="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            @click="sair"
          >
            Sair
          </button>
        </div>
        <div v-else class="flex items-center gap-2">
          <RouterLink
            :to="{ name: 'login' }"
            class="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Entrar
          </RouterLink>
          <RouterLink
            :to="{ name: 'registrar' }"
            class="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Criar conta
          </RouterLink>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-4 py-8">
      <slot />
    </main>
  </div>
</template>
