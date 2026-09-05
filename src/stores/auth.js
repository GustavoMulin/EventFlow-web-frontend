import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import api, { getStoredToken, setStoredToken, setUnauthorizedHandler } from '@/lib/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(getStoredToken())
  const ready = ref(false)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  function setToken(value) {
    token.value = value
    setStoredToken(value)
  }

  function clear() {
    user.value = null
    setToken(null)
  }

  async function fetchUser() {
    if (!token.value) {
      ready.value = true
      return null
    }
    try {
      const { data } = await api.get('/user')
      user.value = data.user
    } catch {
      clear()
    } finally {
      ready.value = true
    }
    return user.value
  }

  async function login(credentials) {
    const { data } = await api.post('/login', credentials)
    setToken(data.token)
    user.value = data.user
  }

  async function register(payload) {
    const { data } = await api.post('/register', payload)
    setToken(data.token)
    user.value = data.user
  }

  async function logout() {
    try {
      await api.post('/logout')
    } catch {
      // clear local state regardless
    }
    clear()
  }

  async function updateProfile(payload) {
    const { data } = await api.patch('/user/profile', payload)
    user.value = data.user
  }

  setUnauthorizedHandler(clear)

  return {
    user,
    token,
    ready,
    isAuthenticated,
    fetchUser,
    login,
    register,
    logout,
    updateProfile,
  }
})
