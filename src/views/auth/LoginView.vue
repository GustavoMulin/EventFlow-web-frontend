<script setup>
import { reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { errorMessage, validationErrors } from '@/lib/api'
import GuestLayout from '@/layouts/GuestLayout.vue'
import UiField from '@/components/ui/UiField.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiAlert from '@/components/ui/UiAlert.vue'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const form = reactive({ email: '', password: '', code: '', recovery_code: '' })
const errors = ref({})
const formError = ref('')
const loading = ref(false)
const twoFactor = ref(false)
const useRecoveryCode = ref(false)

async function submit() {
  loading.value = true
  errors.value = {}
  formError.value = ''
  try {
    const payload = { email: form.email, password: form.password }
    if (twoFactor.value) {
      if (useRecoveryCode.value) payload.recovery_code = form.recovery_code
      else payload.code = form.code
    }
    const { twoFactorRequired } = await auth.login(payload)
    if (twoFactorRequired) {
      twoFactor.value = true
      return
    }
    router.push(route.query.redirect?.toString() || { name: 'dashboard' })
  } catch (error) {
    errors.value = validationErrors(error)
    if (!Object.keys(errors.value).length) formError.value = errorMessage(error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <GuestLayout title="Sign in">
    <form class="space-y-4" @submit.prevent="submit">
      <UiAlert v-if="formError" variant="error">{{ formError }}</UiAlert>

      <template v-if="!twoFactor">
        <UiField
          v-model="form.email"
          label="E-mail"
          type="email"
          autocomplete="email"
          required
          :error="errors.email"
        />
        <UiField
          v-model="form.password"
          label="Password"
          type="password"
          autocomplete="current-password"
          required
          :error="errors.password"
        />
      </template>

      <template v-else>
        <p class="text-sm text-slate-600 dark:text-slate-400">
          Enter the code from your authenticator app.
        </p>
        <UiField
          v-if="!useRecoveryCode"
          v-model="form.code"
          label="Authentication code"
          autocomplete="one-time-code"
          :error="errors.code"
        />
        <UiField
          v-else
          v-model="form.recovery_code"
          label="Recovery code"
          :error="errors.recovery_code"
        />
        <button
          type="button"
          class="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          @click="useRecoveryCode = !useRecoveryCode"
        >
          {{ useRecoveryCode ? 'Use an authentication code' : 'Use a recovery code' }}
        </button>
      </template>

      <UiButton type="submit" :loading="loading" class="w-full">Sign in</UiButton>
    </form>

    <template #footer>
      <RouterLink :to="{ name: 'forgot-password' }" class="hover:underline">
        Forgot your password?
      </RouterLink>
      <span class="mx-2">·</span>
      <RouterLink :to="{ name: 'register' }" class="hover:underline">Create an account</RouterLink>
    </template>
  </GuestLayout>
</template>
