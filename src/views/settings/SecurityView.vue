<script setup>
import { reactive, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api, { errorMessage, validationErrors } from '@/lib/api'
import AppLayout from '@/layouts/AppLayout.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiField from '@/components/ui/UiField.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiAlert from '@/components/ui/UiAlert.vue'

const auth = useAuthStore()

// --- Password ---
const pwForm = reactive({ current_password: '', password: '', password_confirmation: '' })
const pwErrors = ref({})
const pwFeedback = ref({ type: '', message: '' })
const pwLoading = ref(false)

async function updatePassword() {
  pwLoading.value = true
  pwErrors.value = {}
  pwFeedback.value = { type: '', message: '' }
  try {
    await auth.updatePassword({ ...pwForm })
    pwFeedback.value = { type: 'success', message: 'Password updated.' }
    Object.assign(pwForm, { current_password: '', password: '', password_confirmation: '' })
  } catch (error) {
    pwErrors.value = validationErrors(error)
    if (!Object.keys(pwErrors.value).length) {
      pwFeedback.value = { type: 'error', message: errorMessage(error) }
    }
  } finally {
    pwLoading.value = false
  }
}

// --- Two-factor ---
const tf = reactive({
  setup: null, // { svg, secret_key, recovery_codes }
  confirmCode: '',
  recoveryCodes: [],
  error: '',
  busy: false,
})

async function enable() {
  tf.busy = true
  tf.error = ''
  try {
    const { data } = await api.post('/user/two-factor')
    tf.setup = data
  } catch (error) {
    tf.error = errorMessage(error)
  } finally {
    tf.busy = false
  }
}

async function confirm() {
  tf.busy = true
  tf.error = ''
  try {
    const { data } = await api.post('/user/two-factor/confirm', { code: tf.confirmCode })
    tf.recoveryCodes = data.recovery_codes
    tf.setup = null
    tf.confirmCode = ''
    await auth.fetchUser()
  } catch (error) {
    tf.error = validationErrors(error).code || errorMessage(error)
  } finally {
    tf.busy = false
  }
}

async function disable() {
  tf.busy = true
  tf.error = ''
  try {
    await api.delete('/user/two-factor')
    tf.setup = null
    tf.recoveryCodes = []
    await auth.fetchUser()
  } catch (error) {
    tf.error = errorMessage(error)
  } finally {
    tf.busy = false
  }
}

async function showRecoveryCodes() {
  const { data } = await api.get('/user/two-factor/recovery-codes')
  tf.recoveryCodes = data.recovery_codes
}

async function regenerateRecoveryCodes() {
  const { data } = await api.post('/user/two-factor/recovery-codes')
  tf.recoveryCodes = data.recovery_codes
}
</script>

<template>
  <AppLayout>
    <h1 class="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">Security</h1>

    <div class="space-y-6">
      <UiCard title="Update password" subtitle="Use a long, unique password.">
        <form class="max-w-md space-y-4" @submit.prevent="updatePassword">
          <UiAlert v-if="pwFeedback.message" :variant="pwFeedback.type">
            {{ pwFeedback.message }}
          </UiAlert>
          <UiField
            v-model="pwForm.current_password"
            label="Current password"
            type="password"
            autocomplete="current-password"
            required
            :error="pwErrors.current_password"
          />
          <UiField
            v-model="pwForm.password"
            label="New password"
            type="password"
            autocomplete="new-password"
            required
            :error="pwErrors.password"
          />
          <UiField
            v-model="pwForm.password_confirmation"
            label="Confirm new password"
            type="password"
            autocomplete="new-password"
            required
          />
          <UiButton type="submit" :loading="pwLoading">Update password</UiButton>
        </form>
      </UiCard>

      <UiCard title="Two-factor authentication">
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-base font-semibold text-slate-900 dark:text-slate-100">
              Two-factor authentication
            </h2>
            <span
              class="rounded-full px-2 py-0.5 text-xs font-medium"
              :class="
                auth.twoFactorEnabled
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
              "
            >
              {{ auth.twoFactorEnabled ? 'Enabled' : 'Disabled' }}
            </span>
          </div>
        </template>

        <UiAlert v-if="tf.error" variant="error" class="mb-4">{{ tf.error }}</UiAlert>

        <!-- Enabled -->
        <div v-if="auth.twoFactorEnabled" class="space-y-4">
          <div class="flex flex-wrap gap-2">
            <UiButton variant="secondary" @click="showRecoveryCodes">Show recovery codes</UiButton>
            <UiButton variant="secondary" @click="regenerateRecoveryCodes">
              Regenerate recovery codes
            </UiButton>
            <UiButton variant="danger" :loading="tf.busy" @click="disable">Disable 2FA</UiButton>
          </div>
        </div>

        <!-- Setup in progress -->
        <div v-else-if="tf.setup" class="space-y-4">
          <p class="text-sm text-slate-600 dark:text-slate-400">
            Scan this QR code with your authenticator app, then enter the generated code to confirm.
          </p>
          <div class="inline-block rounded-lg bg-white p-3" v-html="tf.setup.svg" />
          <p class="text-sm">
            <span class="text-slate-500 dark:text-slate-400">Setup key:</span>
            <code class="ml-1 rounded bg-slate-100 px-1 dark:bg-slate-800">
              {{ tf.setup.secret_key }}
            </code>
          </p>
          <form class="flex max-w-xs items-end gap-2" @submit.prevent="confirm">
            <UiField v-model="tf.confirmCode" label="Confirmation code" class="flex-1" />
            <UiButton type="submit" :loading="tf.busy">Confirm</UiButton>
          </form>
        </div>

        <!-- Disabled -->
        <div v-else>
          <p class="mb-4 text-sm text-slate-600 dark:text-slate-400">
            Add an extra layer of security to your account.
          </p>
          <UiButton :loading="tf.busy" @click="enable">Enable 2FA</UiButton>
        </div>

        <!-- Recovery codes (shared) -->
        <div v-if="tf.recoveryCodes.length" class="mt-4">
          <p class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            Recovery codes — store these somewhere safe.
          </p>
          <ul
            class="grid grid-cols-2 gap-1 rounded-md bg-slate-100 p-3 font-mono text-sm dark:bg-slate-800"
          >
            <li v-for="code in tf.recoveryCodes" :key="code">{{ code }}</li>
          </ul>
        </div>
      </UiCard>
    </div>
  </AppLayout>
</template>
