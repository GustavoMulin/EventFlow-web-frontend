import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import api, { getStoredToken, setStoredToken, setUnauthorizedHandler } from '@/lib/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(getStoredToken())
  const twoFactorEnabled = ref(false)
  const emailVerified = ref(false)
  const ready = ref(false)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  function setToken(value) {
    token.value = value
    setStoredToken(value)
  }

  function clear() {
    user.value = null
    twoFactorEnabled.value = false
    emailVerified.value = false
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
      twoFactorEnabled.value = data.two_factor_enabled
      emailVerified.value = data.email_verified
    } catch {
      clear()
    } finally {
      ready.value = true
    }
    return user.value
  }

  async function login(credentials) {
    const { data } = await api.post('/login', credentials)
    // Valid credentials but a second factor is still required.
    if (data.two_factor) {
      return { twoFactorRequired: true }
    }
    setToken(data.token)
    user.value = data.user
    await fetchUser()
    return { twoFactorRequired: false }
  }

  async function register(payload) {
    const { data } = await api.post('/register', payload)
    setToken(data.token)
    user.value = data.user
    await fetchUser()
  }

  async function logout() {
    try {
      await api.post('/logout')
    } catch {
      // ignore — we clear local state regardless
    }
    clear()
  }

  function forgotPassword(email) {
    return api.post('/forgot-password', { email })
  }

  function resetPassword(payload) {
    return api.post('/reset-password', payload)
  }

  function resendVerificationEmail() {
    return api.post('/email/verification-notification')
  }

  async function updateProfile(payload) {
    const { data } = await api.patch('/user/profile', payload)
    user.value = data.user
    await fetchUser()
  }

  async function updatePassword(payload) {
    const { data } = await api.put('/user/password', payload)
    setToken(data.token)
  }

  async function deleteAccount(password) {
    await api.delete('/user', { data: { password } })
    clear()
  }

  setUnauthorizedHandler(clear)

  return {
    user,
    token,
    twoFactorEnabled,
    emailVerified,
    ready,
    isAuthenticated,
    fetchUser,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    resendVerificationEmail,
    updateProfile,
    updatePassword,
    deleteAccount,
  }
})
