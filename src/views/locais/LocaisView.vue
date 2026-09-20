<script setup>
import { onMounted, reactive, ref } from 'vue'
import { errorMessage, validationErrors } from '@/lib/api'
import { atualizarLocal, criarLocal, excluirLocal, listarLocais } from '@/services/locais'
import { buscarEndereco } from '@/services/geocodificacao'
import AppLayout from '@/layouts/AppLayout.vue'
import MapaLocal from '@/components/mapa/MapaLocal.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiField from '@/components/ui/UiField.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiAlert from '@/components/ui/UiAlert.vue'
import UiModal from '@/components/ui/UiModal.vue'

const locais = ref([])
const carregando = ref(true)
const erro = ref('')

// formulário (criar / editar)
const formAberto = ref(false)
const editandoId = ref(null)
const form = reactive({ nome: '', endereco: '', latitude: '', longitude: '' })
const erros = ref({})
const erroForm = ref('')
const salvando = ref(false)

// busca de endereço (Nominatim)
const resultados = ref([])
const buscando = ref(false)
const buscaFeita = ref(false)
const erroBusca = ref('')

// exclusão
const paraExcluir = ref(null)
const excluindo = ref(false)

async function carregar() {
  try {
    locais.value = await listarLocais()
  } catch (error) {
    erro.value = errorMessage(error, 'Não foi possível carregar os locais.')
  } finally {
    carregando.value = false
  }
}

onMounted(carregar)

function limparBusca() {
  resultados.value = []
  buscaFeita.value = false
  erroBusca.value = ''
}

function novoLocal() {
  editandoId.value = null
  Object.assign(form, { nome: '', endereco: '', latitude: '', longitude: '' })
  erros.value = {}
  erroForm.value = ''
  limparBusca()
  formAberto.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function editarLocal(local) {
  editandoId.value = local.id
  Object.assign(form, {
    nome: local.nome,
    endereco: local.endereco ?? '',
    latitude: local.latitude,
    longitude: local.longitude,
  })
  erros.value = {}
  erroForm.value = ''
  limparBusca()
  formAberto.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function definirCoordenadas({ latitude, longitude }) {
  form.latitude = latitude
  form.longitude = longitude
}

async function pesquisar() {
  buscando.value = true
  erroBusca.value = ''
  buscaFeita.value = false
  try {
    resultados.value = await buscarEndereco(form.endereco)
    buscaFeita.value = true
  } catch (error) {
    resultados.value = []
    erroBusca.value = error.message
  } finally {
    buscando.value = false
  }
}

function escolherResultado(resultado) {
  form.endereco = resultado.nome
  form.latitude = resultado.latitude
  form.longitude = resultado.longitude
  if (!form.nome) form.nome = resultado.nome.split(',')[0]
  limparBusca()
}

async function salvar() {
  salvando.value = true
  erros.value = {}
  erroForm.value = ''
  const dados = {
    nome: form.nome,
    endereco: form.endereco || null,
    latitude: form.latitude,
    longitude: form.longitude,
  }
  try {
    if (editandoId.value) await atualizarLocal(editandoId.value, dados)
    else await criarLocal(dados)
    formAberto.value = false
    await carregar()
  } catch (error) {
    erros.value = validationErrors(error)
    if (!Object.keys(erros.value).length) erroForm.value = errorMessage(error)
  } finally {
    salvando.value = false
  }
}

async function excluir() {
  excluindo.value = true
  erro.value = ''
  try {
    await excluirLocal(paraExcluir.value.id)
    await carregar()
  } catch (error) {
    // 409: o local ainda tem eventos vinculados
    erro.value = errorMessage(error, 'Não foi possível excluir o local.')
  } finally {
    excluindo.value = false
    paraExcluir.value = null
  }
}
</script>

<template>
  <AppLayout>
    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Locais</h1>
      <UiButton v-if="!formAberto" @click="novoLocal">Novo local</UiButton>
    </div>

    <UiAlert v-if="erro" variant="error" class="mb-6">{{ erro }}</UiAlert>

    <!-- Formulário -->
    <UiCard
      v-if="formAberto"
      class="mb-6 max-w-3xl"
      :title="editandoId ? 'Editar local' : 'Novo local'"
      subtitle="Busque um endereço para preencher a latitude e a longitude, ou marque a posição no mapa."
    >
      <form class="space-y-4" @submit.prevent="salvar">
        <UiAlert v-if="erroForm" variant="error">{{ erroForm }}</UiAlert>

        <UiField v-model="form.nome" label="Nome do local" required :error="erros.nome" />

        <div>
          <div class="flex items-end gap-2">
            <div class="flex-1">
              <UiField
                v-model="form.endereco"
                label="Endereço (opcional)"
                placeholder="Ex.: Av. Paulista, 1000, São Paulo"
                :error="erros.endereco"
                @keydown.enter.prevent="pesquisar"
              />
            </div>
            <UiButton variant="secondary" :loading="buscando" @click="pesquisar">
              Buscar no mapa
            </UiButton>
          </div>

          <UiAlert v-if="erroBusca" variant="error" class="mt-2">{{ erroBusca }}</UiAlert>
          <p v-else-if="buscaFeita && !resultados.length" class="mt-2 text-sm text-slate-500">
            Nenhum resultado encontrado. Tente outro endereço ou marque a posição no mapa.
          </p>
          <ul
            v-if="resultados.length"
            class="mt-2 divide-y divide-slate-200 rounded-md border border-slate-200 text-sm dark:divide-slate-800 dark:border-slate-700"
          >
            <li
              v-for="resultado in resultados"
              :key="`${resultado.latitude},${resultado.longitude}`"
            >
              <button
                type="button"
                class="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800"
                @click="escolherResultado(resultado)"
              >
                {{ resultado.nome }}
              </button>
            </li>
          </ul>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <UiField
            v-model="form.latitude"
            label="Latitude"
            type="number"
            step="any"
            min="-90"
            max="90"
            required
            :error="erros.latitude"
          />
          <UiField
            v-model="form.longitude"
            label="Longitude"
            type="number"
            step="any"
            min="-180"
            max="180"
            required
            :error="erros.longitude"
          />
        </div>

        <MapaLocal
          :latitude="form.latitude"
          :longitude="form.longitude"
          @escolher="definirCoordenadas"
        />

        <div class="flex gap-3">
          <UiButton type="submit" :loading="salvando">
            {{ editandoId ? 'Salvar alterações' : 'Cadastrar local' }}
          </UiButton>
          <UiButton variant="secondary" @click="formAberto = false">Cancelar</UiButton>
        </div>
      </form>
    </UiCard>

    <!-- Lista -->
    <p v-if="carregando" class="text-sm text-slate-500">Carregando locais…</p>
    <p
      v-else-if="!locais.length"
      class="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700"
    >
      Nenhum local cadastrado.
    </p>

    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <UiCard v-for="local in locais" :key="local.id">
        <h3 class="font-semibold text-slate-900 dark:text-slate-100">{{ local.nome }}</h3>
        <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {{ local.endereco || 'Endereço não informado' }}
        </p>
        <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {{ local.latitude }}, {{ local.longitude }} · {{ local.eventos_count }} evento(s)
        </p>
        <div class="mt-4 flex gap-3 text-sm">
          <button
            type="button"
            class="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            @click="editarLocal(local)"
          >
            Editar
          </button>
          <button
            type="button"
            class="font-medium text-red-600 hover:underline dark:text-red-400"
            @click="paraExcluir = local"
          >
            Excluir
          </button>
        </div>
      </UiCard>
    </div>

    <UiModal
      :aberto="paraExcluir !== null"
      titulo="Excluir local"
      confirmar-texto="Excluir"
      :carregando="excluindo"
      @confirmar="excluir"
      @cancelar="paraExcluir = null"
    >
      Excluir o local <strong>{{ paraExcluir?.nome }}</strong
      >? Locais com eventos vinculados não podem ser excluídos.
    </UiModal>
  </AppLayout>
</template>
