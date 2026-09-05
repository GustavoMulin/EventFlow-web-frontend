<script setup>
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { errorMessage, validationErrors } from '@/lib/api'
import GuestLayout from '@/layouts/GuestLayout.vue'
import UiField from '@/components/ui/UiField.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiAlert from '@/components/ui/UiAlert.vue'

const auth = useAuthStore()
const router = useRouter()

const form = reactive({ name: '', email: '', password: '', password_confirmation: '' })
const errors = ref({})
const formError = ref('')
const loading = ref(false)

async function submit() {
  loading.value = true
  errors.value = {}
  formError.value = ''
  try {
    await auth.register({ ...form })
    router.push({ name: 'dashboard' })
  } catch (error) {
    errors.value = validationErrors(error)
    if (!Object.keys(errors.value).length) formError.value = errorMessage(error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <GuestLayout title="Create your account">
    <form class="space-y-4" @submit.prevent="submit">
      <UiAlert v-if="formError" variant="error">{{ formError }}</UiAlert>
      <UiField v-model="form.name" label="Name" autocomplete="name" required :error="errors.name" />
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
        autocomplete="new-password"
        required
        :error="errors.password"
      />
      <UiField
        v-model="form.password_confirmation"
        label="Confirm password"
        type="password"
        autocomplete="new-password"
        required
      />
      <UiButton type="submit" :loading="loading" class="w-full">Create account</UiButton>
    </form>

    <template #footer>
      Already registered?
      <RouterLink :to="{ name: 'login' }" class="font-medium hover:underline">Sign in</RouterLink>
    </template>
  </GuestLayout>
</template>
