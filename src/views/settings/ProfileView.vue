<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { errorMessage, validationErrors } from '@/lib/api'
import AppLayout from '@/layouts/AppLayout.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiField from '@/components/ui/UiField.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiAlert from '@/components/ui/UiAlert.vue'

const auth = useAuthStore()
const router = useRouter()

const form = reactive({ name: auth.user?.name ?? '', email: auth.user?.email ?? '' })
const errors = ref({})
const feedback = ref({ type: '', message: '' })
const loading = ref(false)

const verifyState = ref('')

async function save() {
  loading.value = true
  errors.value = {}
  feedback.value = { type: '', message: '' }
  try {
    await auth.updateProfile({ ...form })
    feedback.value = { type: 'success', message: 'Profile updated.' }
  } catch (error) {
    errors.value = validationErrors(error)
    if (!Object.keys(errors.value).length) {
      feedback.value = { type: 'error', message: errorMessage(error) }
    }
  } finally {
    loading.value = false
  }
}

async function resendVerification() {
  verifyState.value = 'sending'
  try {
    await auth.resendVerificationEmail()
    verifyState.value = 'sent'
  } catch {
    verifyState.value = 'error'
  }
}

// --- Delete account ---
const deleteForm = reactive({ password: '' })
const deleteErrors = ref({})
const deleting = ref(false)
const confirmingDelete = ref(false)

async function destroy() {
  deleting.value = true
  deleteErrors.value = {}
  try {
    await auth.deleteAccount(deleteForm.password)
    router.push({ name: 'login' })
  } catch (error) {
    deleteErrors.value = validationErrors(error)
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <AppLayout>
    <h1 class="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">Profile</h1>

    <div class="space-y-6">
      <UiCard title="Profile information" subtitle="Update your name and e-mail address.">
        <form class="max-w-md space-y-4" @submit.prevent="save">
          <UiAlert v-if="feedback.message" :variant="feedback.type">{{ feedback.message }}</UiAlert>
          <UiField v-model="form.name" label="Name" required :error="errors.name" />
          <UiField
            v-model="form.email"
            label="E-mail"
            type="email"
            required
            :error="errors.email"
          />

          <div v-if="!auth.emailVerified" class="text-sm">
            <span class="text-amber-600 dark:text-amber-400">Your e-mail is unverified.</span>
            <button
              type="button"
              class="ml-1 font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              :disabled="verifyState === 'sending'"
              @click="resendVerification"
            >
              Resend verification e-mail
            </button>
            <span v-if="verifyState === 'sent'" class="ml-1 text-green-600 dark:text-green-400">
              Sent!
            </span>
          </div>

          <UiButton type="submit" :loading="loading">Save</UiButton>
        </form>
      </UiCard>

      <UiCard title="Delete account">
        <template #header>
          <h2 class="text-base font-semibold text-red-600 dark:text-red-400">Delete account</h2>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
            This permanently deletes your account and cannot be undone.
          </p>
        </template>

        <UiButton v-if="!confirmingDelete" variant="danger" @click="confirmingDelete = true">
          Delete account
        </UiButton>

        <form v-else class="max-w-md space-y-4" @submit.prevent="destroy">
          <UiField
            v-model="deleteForm.password"
            label="Confirm your password"
            type="password"
            autocomplete="current-password"
            required
            :error="deleteErrors.password"
          />
          <div class="flex gap-2">
            <UiButton type="submit" variant="danger" :loading="deleting">
              Permanently delete
            </UiButton>
            <UiButton type="button" variant="secondary" @click="confirmingDelete = false">
              Cancel
            </UiButton>
          </div>
        </form>
      </UiCard>
    </div>
  </AppLayout>
</template>
