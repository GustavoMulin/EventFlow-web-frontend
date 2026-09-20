import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// meta.requiresAuth -> só logado | meta.guestOnly -> só visitante | sem meta -> público
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/eventos' },

    // --- Autenticação ---
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { guestOnly: true, titulo: 'Entrar' },
    },
    {
      path: '/registrar',
      name: 'registrar',
      component: () => import('@/views/auth/RegistrarView.vue'),
      meta: { guestOnly: true, titulo: 'Criar conta' },
    },

    // --- Eventos ---
    {
      path: '/eventos',
      name: 'eventos',
      component: () => import('@/views/eventos/EventosView.vue'),
      meta: { titulo: 'Eventos' },
    },
    {
      path: '/eventos/novo',
      name: 'evento.novo',
      component: () => import('@/views/eventos/EventoFormView.vue'),
      meta: { requiresAuth: true, titulo: 'Novo evento' },
    },
    {
      // O :id só aceita números (\d+), então "novo" nunca é confundido com um id.
      path: '/eventos/:id(\\d+)',
      name: 'evento',
      component: () => import('@/views/eventos/EventoDetalheView.vue'),
      meta: { titulo: 'Detalhes do evento' },
    },
    {
      path: '/eventos/:id(\\d+)/editar',
      name: 'evento.editar',
      component: () => import('@/views/eventos/EventoFormView.vue'),
      meta: { requiresAuth: true, titulo: 'Editar evento' },
    },

    // --- Cadastros de apoio ---
    {
      path: '/categorias',
      name: 'categorias',
      component: () => import('@/views/categorias/CategoriasView.vue'),
      meta: { requiresAuth: true, titulo: 'Categorias' },
    },
    {
      path: '/locais',
      name: 'locais',
      component: () => import('@/views/locais/LocaisView.vue'),
      meta: { requiresAuth: true, titulo: 'Locais' },
    },

    // --- Mapa e perfil ---
    {
      path: '/mapa',
      name: 'mapa',
      component: () => import('@/views/mapa/MapaView.vue'),
      meta: { titulo: 'Mapa de eventos' },
    },
    {
      path: '/perfil',
      name: 'perfil',
      component: () => import('@/views/perfil/PerfilView.vue'),
      meta: { requiresAuth: true, titulo: 'Perfil' },
    },

    { path: '/:pathMatch(.*)*', redirect: '/eventos' },
  ],
  // Ao trocar de página volta ao topo.
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  // Resolve a sessão uma única vez ao abrir/atualizar a página.
  if (!auth.ready) {
    await auth.fetchUser()
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'eventos' }
  }

  return true
})

router.afterEach((to) => {
  document.title = to.meta.titulo ? `${to.meta.titulo} · EventFlow` : 'EventFlow'
})

export default router
