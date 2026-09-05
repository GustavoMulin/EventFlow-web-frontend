<script setup>
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import GuestLayout from '@/layouts/GuestLayout.vue'
import UiAlert from '@/components/ui/UiAlert.vue'

const route = useRoute()
const auth = useAuthStore()

// The API redirects here as /verify-email?status=verified|invalid
const status = computed(() => route.query.status?.toString() || 'unknown')
</script>

<template>
  <GuestLayout title="E-mail verification">
    <UiAlert v-if="status === 'verified'" variant="success">
      Your e-mail address has been verified.
    </UiAlert>
    <UiAlert v-else-if="status === 'invalid'" variant="error">
      This verification link is invalid or has expired.
    </UiAlert>
    <UiAlert v-else variant="info">
      Open the verification link from your inbox to continue.
    </UiAlert>

    <div class="mt-4 text-center text-sm">
      <RouterLink
        :to="{ name: auth.isAuthenticated ? 'dashboard' : 'login' }"
        class="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
      >
        Continue
      </RouterLink>
    </div>
  </GuestLayout>
</template>
