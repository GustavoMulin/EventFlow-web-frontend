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

async function salvar() {
  loading.value = true
  errors.value = {}
  feedback.value = { type: '', message: '' }
  try {
    await auth.updateProfile({ ...form })
    feedback.value = { type: 'success', message: 'Perfil atualizado.' }
  } catch (error) {
    errors.value = validationErrors(error)
    if (!Object.keys(errors.value).length) {
      feedback.value = { type: 'error', message: errorMessage(error) }
    }
  } finally {
    loading.value = false
  }
}

async function sair() {
  await auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <AppLayout>
    <h1 class="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">Perfil</h1>

    <div class="max-w-md space-y-6">
      <UiCard title="Dados do usuário" subtitle="Atualize seu nome e e-mail.">
        <form class="space-y-4" @submit.prevent="salvar">
          <UiAlert v-if="feedback.message" :variant="feedback.type">
            {{ feedback.message }}
          </UiAlert>
          <UiField v-model="form.name" label="Nome" required :error="errors.name" />
          <UiField
            v-model="form.email"
            label="E-mail"
            type="email"
            required
            :error="errors.email"
          />
          <UiButton type="submit" :loading="loading">Salvar</UiButton>
        </form>
      </UiCard>

      <UiCard title="Sessão">
        <UiButton variant="secondary" @click="sair">Sair</UiButton>
      </UiCard>
    </div>
  </AppLayout>
</template>
