<script setup>
import { onMounted, ref } from 'vue'
import { errorMessage, validationErrors } from '@/lib/api'
import {
  atualizarCategoria,
  criarCategoria,
  excluirCategoria,
  listarCategorias,
} from '@/services/categorias'
import AppLayout from '@/layouts/AppLayout.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiField from '@/components/ui/UiField.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiAlert from '@/components/ui/UiAlert.vue'
import UiModal from '@/components/ui/UiModal.vue'

const categorias = ref([])
const carregando = ref(true)
const erro = ref('')

// nova categoria
const novoNome = ref('')
const erroNovo = ref('')
const criando = ref(false)

// edição inline
const editandoId = ref(null)
const nomeEditado = ref('')
const erroEdicao = ref('')
const salvando = ref(false)

// exclusão
const paraExcluir = ref(null)
const excluindo = ref(false)

async function carregar() {
  try {
    categorias.value = await listarCategorias()
  } catch (error) {
    erro.value = errorMessage(error, 'Não foi possível carregar as categorias.')
  } finally {
    carregando.value = false
  }
}

onMounted(carregar)

async function adicionar() {
  criando.value = true
  erroNovo.value = ''
  try {
    await criarCategoria({ nome: novoNome.value })
    novoNome.value = ''
    await carregar()
  } catch (error) {
    erroNovo.value = validationErrors(error).nome || errorMessage(error)
  } finally {
    criando.value = false
  }
}

function iniciarEdicao(categoria) {
  editandoId.value = categoria.id
  nomeEditado.value = categoria.nome
  erroEdicao.value = ''
}

async function salvarEdicao(categoria) {
  salvando.value = true
  erroEdicao.value = ''
  try {
    await atualizarCategoria(categoria.id, { nome: nomeEditado.value })
    editandoId.value = null
    await carregar()
  } catch (error) {
    erroEdicao.value = validationErrors(error).nome || errorMessage(error)
  } finally {
    salvando.value = false
  }
}

async function excluir() {
  excluindo.value = true
  erro.value = ''
  try {
    await excluirCategoria(paraExcluir.value.id)
    await carregar()
  } catch (error) {
    // 409: a categoria ainda tem eventos vinculados
    erro.value = errorMessage(error, 'Não foi possível excluir a categoria.')
  } finally {
    excluindo.value = false
    paraExcluir.value = null
  }
}
</script>

<template>
  <AppLayout>
    <h1 class="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">Categorias</h1>

    <div class="max-w-2xl space-y-6">
      <UiAlert v-if="erro" variant="error">{{ erro }}</UiAlert>

      <UiCard title="Nova categoria">
        <form class="flex items-start gap-2" @submit.prevent="adicionar">
          <div class="flex-1">
            <UiField v-model="novoNome" placeholder="Ex.: Tecnologia" required :error="erroNovo" />
          </div>
          <UiButton type="submit" :loading="criando">Adicionar</UiButton>
        </form>
      </UiCard>

      <UiCard title="Categorias cadastradas">
        <p v-if="carregando" class="text-sm text-slate-500">Carregando…</p>
        <p v-else-if="!categorias.length" class="text-sm text-slate-500">
          Nenhuma categoria cadastrada.
        </p>

        <ul v-else class="divide-y divide-slate-200 dark:divide-slate-800">
          <li v-for="categoria in categorias" :key="categoria.id" class="py-3">
            <form
              v-if="editandoId === categoria.id"
              class="flex items-start gap-2"
              @submit.prevent="salvarEdicao(categoria)"
            >
              <div class="flex-1">
                <UiField v-model="nomeEditado" required :error="erroEdicao" />
              </div>
              <UiButton type="submit" :loading="salvando">Salvar</UiButton>
              <UiButton variant="secondary" @click="editandoId = null">Cancelar</UiButton>
            </form>

            <div v-else class="flex items-center justify-between gap-3">
              <div>
                <span class="font-medium">{{ categoria.nome }}</span>
                <span class="ml-2 text-xs text-slate-500 dark:text-slate-400">
                  {{ categoria.eventos_count }} evento(s)
                </span>
              </div>
              <div class="flex gap-3 text-sm">
                <button
                  type="button"
                  class="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                  @click="iniciarEdicao(categoria)"
                >
                  Editar
                </button>
                <button
                  type="button"
                  class="font-medium text-red-600 hover:underline dark:text-red-400"
                  @click="paraExcluir = categoria"
                >
                  Excluir
                </button>
              </div>
            </div>
          </li>
        </ul>
      </UiCard>
    </div>

    <UiModal
      :aberto="paraExcluir !== null"
      titulo="Excluir categoria"
      confirmar-texto="Excluir"
      :carregando="excluindo"
      @confirmar="excluir"
      @cancelar="paraExcluir = null"
    >
      Excluir a categoria <strong>{{ paraExcluir?.nome }}</strong
      >? Categorias com eventos vinculados não podem ser excluídas.
    </UiModal>
  </AppLayout>
</template>
