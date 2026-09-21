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

const form = reactive({ email: '', password: '' })
const errors = ref({})
const formError = ref('')
const loading = ref(false)

async function submit() {
  loading.value = true
  errors.value = {}
  formError.value = ''
  try {
    await auth.login({ ...form })
    router.push(route.query.redirect?.toString() || { name: 'eventos' })
  } catch (error) {
    errors.value = validationErrors(error)
    if (!Object.keys(errors.value).length) formError.value = errorMessage(error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <GuestLayout title="Entrar">
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
        label="Senha"
        type="password"
        autocomplete="current-password"
        required
        :error="errors.password"
      />

      <UiButton type="submit" :loading="loading" class="w-full">Entrar</UiButton>
    </form>

    <template #footer>
      <RouterLink :to="{ name: 'registrar' }" class="hover:underline">Criar uma conta</RouterLink>
    </template>
  </GuestLayout>
</template>
