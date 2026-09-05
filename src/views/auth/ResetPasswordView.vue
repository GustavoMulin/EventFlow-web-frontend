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

const form = reactive({
  token: route.query.token?.toString() || '',
  email: route.query.email?.toString() || '',
  password: '',
  password_confirmation: '',
})
const errors = ref({})
const formError = ref('')
const loading = ref(false)

async function submit() {
  loading.value = true
  errors.value = {}
  formError.value = ''
  try {
    await auth.resetPassword({ ...form })
    router.push({ name: 'login', query: { reset: '1' } })
  } catch (error) {
    errors.value = validationErrors(error)
    if (!Object.keys(errors.value).length) formError.value = errorMessage(error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <GuestLayout title="Choose a new password">
    <form class="space-y-4" @submit.prevent="submit">
      <UiAlert v-if="formError" variant="error">{{ formError }}</UiAlert>
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
        label="New password"
        type="password"
        autocomplete="new-password"
        required
        :error="errors.password"
      />
      <UiField
        v-model="form.password_confirmation"
        label="Confirm new password"
        type="password"
        autocomplete="new-password"
        required
      />
      <UiButton type="submit" :loading="loading" class="w-full">Reset password</UiButton>
    </form>

    <template #footer>
      <RouterLink :to="{ name: 'login' }" class="hover:underline">Back to sign in</RouterLink>
    </template>
  </GuestLayout>
</template>
