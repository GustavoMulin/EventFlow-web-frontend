<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { errorMessage, validationErrors } from '@/lib/api'
import { buscarEvento, excluirEvento } from '@/services/eventos'
import {
  baixarIngresso,
  cancelarInscricao,
  criarInscricao,
  listarInscricoes,
} from '@/services/inscricoes'
import { formatarData, formatarDataHora, formatarHora, formatarMoeda } from '@/lib/formatadores'
import AppLayout from '@/layouts/AppLayout.vue'
import MapaEventos from '@/components/mapa/MapaEventos.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiField from '@/components/ui/UiField.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiAlert from '@/components/ui/UiAlert.vue'
import UiModal from '@/components/ui/UiModal.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const evento = ref(null)
const carregando = ref(true)
const erro = ref('')
const erroAcao = ref('')
const inscritos = ref([])

const esgotado = computed(() => evento.value !== null && evento.value.vagas_restantes <= 0)

// Array estável para o mapa: se fosse `[evento]` inline, seria recriado a cada render
// (ex.: ao digitar no formulário) e o mapa perderia o zoom do usuário.
const eventosNoMapa = computed(() => (evento.value ? [evento.value] : []))

async function carregarEvento() {
  try {
    evento.value = await buscarEvento(route.params.id)
    erro.value = ''
  } catch (error) {
    erro.value =
      error.response?.status === 404
        ? 'Evento não encontrado.'
        : errorMessage(error, 'Não foi possível carregar o evento.')
  } finally {
    carregando.value = false
  }
}

async function carregarInscritos() {
  if (!auth.isAuthenticated) return
  try {
    inscritos.value = await listarInscricoes(route.params.id)
  } catch {
    // a lista de inscritos é secundária: uma falha aqui não deve esconder o evento
  }
}

onMounted(async () => {
  await carregarEvento()
  await carregarInscritos()
})

// ---------- Inscrição (pública) ----------
const form = reactive({ nome: '', email: '', documento: '' })
const erros = ref({})
const erroForm = ref('')
const enviando = ref(false)
const inscricaoFeita = ref(null)
const baixando = ref(null) // código da inscrição com PDF sendo baixado

async function enviarInscricao() {
  enviando.value = true
  erros.value = {}
  erroForm.value = ''
  inscricaoFeita.value = null
  try {
    inscricaoFeita.value = await criarInscricao(evento.value.id, { ...form })
    Object.assign(form, { nome: '', email: '', documento: '' })
    await Promise.all([carregarEvento(), carregarInscritos()])
  } catch (error) {
    erros.value = validationErrors(error)
    // "evento" = regra de negócio (vagas esgotadas / inscrições encerradas)
    erroForm.value =
      erros.value.evento || (Object.keys(erros.value).length ? '' : errorMessage(error))
  } finally {
    enviando.value = false
  }
}

async function baixar(inscricao) {
  baixando.value = inscricao.codigo
  erroAcao.value = ''
  try {
    await baixarIngresso(inscricao)
  } catch {
    erroAcao.value = 'Não foi possível baixar o ingresso. Tente novamente.'
  } finally {
    baixando.value = null
  }
}

// ---------- Gestão (autenticado) ----------
const confirmarExclusao = ref(false)
const excluindo = ref(false)
const inscricaoParaCancelar = ref(null)
const cancelando = ref(false)

async function excluir() {
  excluindo.value = true
  try {
    await excluirEvento(evento.value.id)
    router.push({ name: 'eventos' })
  } catch (error) {
    erroAcao.value = errorMessage(error, 'Não foi possível excluir o evento.')
    confirmarExclusao.value = false
  } finally {
    excluindo.value = false
  }
}

async function cancelar() {
  cancelando.value = true
  try {
    await cancelarInscricao(inscricaoParaCancelar.value.codigo)
    inscricaoParaCancelar.value = null
    await Promise.all([carregarEvento(), carregarInscritos()])
  } catch (error) {
    erroAcao.value = errorMessage(error, 'Não foi possível cancelar a inscrição.')
    inscricaoParaCancelar.value = null
  } finally {
    cancelando.value = false
  }
}
</script>

<template>
  <AppLayout>
    <RouterLink
      :to="{ name: 'eventos' }"
      class="mb-4 inline-block text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
    >
      ← Voltar para os eventos
    </RouterLink>

    <p v-if="carregando" class="text-sm text-slate-500">Carregando evento…</p>
    <UiAlert v-else-if="erro" variant="error">{{ erro }}</UiAlert>

    <template v-else-if="evento">
      <UiAlert v-if="erroAcao" variant="error" class="mb-4">{{ erroAcao }}</UiAlert>

      <!-- Banner -->
      <div
        class="mb-6 aspect-[21/8] w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800"
      >
        <img
          v-if="evento.banner_url"
          :src="evento.banner_url"
          :alt="`Banner de ${evento.nome}`"
          class="h-full w-full object-cover"
        />
        <div
          v-else
          class="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600 text-lg font-semibold text-white/90"
        >
          {{ evento.nome }}
        </div>
      </div>

      <!-- Título e ações -->
      <div class="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <span
            v-if="evento.categoria"
            class="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
          >
            {{ evento.categoria.nome }}
          </span>
          <h1 class="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
            {{ evento.nome }}
          </h1>
        </div>

        <div v-if="auth.isAuthenticated" class="flex gap-2">
          <RouterLink
            :to="{ name: 'evento.editar', params: { id: evento.id } }"
            class="rounded-md bg-white px-3.5 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700"
          >
            Editar
          </RouterLink>
          <UiButton variant="danger" @click="confirmarExclusao = true">Excluir</UiButton>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-3">
        <div class="space-y-6 lg:col-span-2">
          <UiCard title="Informações">
            <dl class="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt class="text-slate-500 dark:text-slate-400">Data</dt>
                <dd class="font-medium">{{ formatarData(evento.data_evento) }}</dd>
              </div>
              <div>
                <dt class="text-slate-500 dark:text-slate-400">Horário</dt>
                <dd class="font-medium">{{ formatarHora(evento.hora_evento) }}</dd>
              </div>
              <div>
                <dt class="text-slate-500 dark:text-slate-400">Valor</dt>
                <dd class="font-medium">{{ formatarMoeda(evento.preco) }}</dd>
              </div>
              <div>
                <dt class="text-slate-500 dark:text-slate-400">Vagas</dt>
                <dd class="font-medium">
                  {{ evento.vagas_restantes }} de {{ evento.vagas }} disponíveis
                </dd>
              </div>
              <div>
                <dt class="text-slate-500 dark:text-slate-400">Local</dt>
                <dd class="font-medium">{{ evento.local?.nome }}</dd>
              </div>
              <div>
                <dt class="text-slate-500 dark:text-slate-400">Endereço</dt>
                <dd class="font-medium">{{ evento.endereco || 'Não informado' }}</dd>
              </div>
            </dl>
          </UiCard>

          <UiCard title="Sobre o evento">
            <p
              class="whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-300"
            >
              {{ evento.descricao }}
            </p>
          </UiCard>

          <UiCard title="Localização">
            <MapaEventos :eventos="eventosNoMapa" altura="320px" />
          </UiCard>
        </div>

        <!-- Inscrição -->
        <div>
          <UiCard title="Inscreva-se" subtitle="Garanta sua vaga e receba o ingresso em PDF.">
            <div v-if="inscricaoFeita" class="space-y-4">
              <UiAlert variant="success">
                Inscrição confirmada, {{ inscricaoFeita.nome }}! Seu código é
                <strong class="break-all">{{ inscricaoFeita.codigo }}</strong>
              </UiAlert>
              <UiButton
                class="w-full"
                :loading="baixando === inscricaoFeita.codigo"
                @click="baixar(inscricaoFeita)"
              >
                Baixar ingresso (PDF)
              </UiButton>
              <button
                type="button"
                class="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                @click="inscricaoFeita = null"
              >
                Fazer outra inscrição
              </button>
            </div>

            <UiAlert v-else-if="esgotado" variant="error">
              As vagas deste evento estão esgotadas.
            </UiAlert>

            <form v-else class="space-y-4" @submit.prevent="enviarInscricao">
              <UiAlert v-if="erroForm" variant="error">{{ erroForm }}</UiAlert>
              <UiField v-model="form.nome" label="Nome completo" required :error="erros.nome" />
              <UiField
                v-model="form.email"
                label="E-mail"
                type="email"
                required
                :error="erros.email"
              />
              <UiField
                v-model="form.documento"
                label="Documento (opcional)"
                placeholder="CPF ou RG"
                :error="erros.documento"
              />
              <UiButton type="submit" class="w-full" :loading="enviando">
                Confirmar inscrição
              </UiButton>
            </form>
          </UiCard>
        </div>
      </div>

      <!-- Participantes (somente logado) -->
      <UiCard
        v-if="auth.isAuthenticated"
        class="mt-6"
        title="Participantes inscritos"
        :subtitle="`${inscritos.length} inscrito(s)`"
      >
        <p v-if="!inscritos.length" class="text-sm text-slate-500">Nenhuma inscrição ainda.</p>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="text-slate-500 dark:text-slate-400">
              <tr>
                <th class="py-2 pr-4 font-medium">Nome</th>
                <th class="py-2 pr-4 font-medium">E-mail</th>
                <th class="py-2 pr-4 font-medium">Documento</th>
                <th class="py-2 pr-4 font-medium">Inscrito em</th>
                <th class="py-2 font-medium"><span class="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
              <tr v-for="inscrito in inscritos" :key="inscrito.codigo">
                <td class="py-2 pr-4">{{ inscrito.nome }}</td>
                <td class="py-2 pr-4">{{ inscrito.email }}</td>
                <td class="py-2 pr-4">{{ inscrito.documento || '—' }}</td>
                <td class="py-2 pr-4">{{ formatarDataHora(inscrito.inscrito_em) }}</td>
                <td class="space-x-3 py-2 text-right whitespace-nowrap">
                  <button
                    type="button"
                    class="font-medium text-indigo-600 hover:underline disabled:opacity-50 dark:text-indigo-400"
                    :disabled="baixando === inscrito.codigo"
                    @click="baixar(inscrito)"
                  >
                    Ingresso PDF
                  </button>
                  <button
                    type="button"
                    class="font-medium text-red-600 hover:underline dark:text-red-400"
                    @click="inscricaoParaCancelar = inscrito"
                  >
                    Cancelar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UiCard>
    </template>

    <UiModal
      :aberto="confirmarExclusao"
      titulo="Excluir evento"
      confirmar-texto="Excluir"
      :carregando="excluindo"
      @confirmar="excluir"
      @cancelar="confirmarExclusao = false"
    >
      Tem certeza que deseja excluir <strong>{{ evento?.nome }}</strong
      >? As inscrições e o banner também serão removidos. Esta ação não pode ser desfeita.
    </UiModal>

    <UiModal
      :aberto="inscricaoParaCancelar !== null"
      titulo="Cancelar inscrição"
      confirmar-texto="Cancelar inscrição"
      :carregando="cancelando"
      @confirmar="cancelar"
      @cancelar="inscricaoParaCancelar = null"
    >
      Cancelar a inscrição de <strong>{{ inscricaoParaCancelar?.nome }}</strong
      >?
    </UiModal>
  </AppLayout>
</template>
