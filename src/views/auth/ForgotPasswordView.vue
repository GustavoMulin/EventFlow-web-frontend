<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { errorMessage, validationErrors } from '@/lib/api'
import GuestLayout from '@/layouts/GuestLayout.vue'
import UiField from '@/components/ui/UiField.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiAlert from '@/components/ui/UiAlert.vue'

const auth = useAuthStore()
const email = ref('')
const errors = ref({})
const formError = ref('')
const status = ref('')
const loading = ref(false)

async function submit() {
  loading.value = true
  errors.value = {}
  formError.value = ''
  status.value = ''
  try {
    const { data } = await auth.forgotPassword(email.value)
    status.value = data.status || 'We have e-mailed you a password reset link.'
  } catch (error) {
    errors.value = validationErrors(error)
    if (!Object.keys(errors.value).length) formError.value = errorMessage(error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <GuestLayout title="Reset your password" subtitle="We'll e-mail you a link to choose a new one.">
    <form class="space-y-4" @submit.prevent="submit">
      <UiAlert v-if="status" variant="success">{{ status }}</UiAlert>
      <UiAlert v-if="formError" variant="error">{{ formError }}</UiAlert>
      <UiField
        v-model="email"
        label="E-mail"
        type="email"
        autocomplete="email"
        required
        :error="errors.email"
      />
      <UiButton type="submit" :loading="loading" class="w-full">Send reset link</UiButton>
    </form>

    <template #footer>
      <RouterLink :to="{ name: 'login' }" class="hover:underline">Back to sign in</RouterLink>
    </template>
  </GuestLayout>
</template>
