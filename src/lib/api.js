import axios from 'axios'

const TOKEN_KEY = 'eventflow_token'

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? 'http://localhost'}/api`,
  headers: { Accept: 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Callback wired up by the auth store so a rejected token forces a logout.
let onUnauthorized = null
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && onUnauthorized) {
      onUnauthorized()
    }
    return Promise.reject(error)
  },
)

/**
 * Pull `{ field: [messages] }` out of a Laravel 422 response.
 */
export function validationErrors(error) {
  const errors = error.response?.data?.errors
  if (!errors) return {}
  return Object.fromEntries(Object.entries(errors).map(([key, messages]) => [key, messages[0]]))
}

export function errorMessage(error, fallback = 'Something went wrong. Please try again.') {
  return error.response?.data?.message ?? fallback
}

export default api
