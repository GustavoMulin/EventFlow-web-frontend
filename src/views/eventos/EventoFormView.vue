<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { errorMessage, validationErrors } from '@/lib/api'
import { atualizarEvento, buscarEvento, criarEvento } from '@/services/eventos'
import { listarCategorias } from '@/services/categorias'
import { listarLocais } from '@/services/locais'
import AppLayout from '@/layouts/AppLayout.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiField from '@/components/ui/UiField.vue'
import UiSelect from '@/components/ui/UiSelect.vue'
import UiTextarea from '@/components/ui/UiTextarea.vue'
import UiImageUpload from '@/components/ui/UiImageUpload.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiAlert from '@/components/ui/UiAlert.vue'

const route = useRoute()
const router = useRouter()

// A mesma tela serve para criar (/eventos/novo) e editar (/eventos/:id/editar).
const id = route.params.id
const editando = Boolean(id)

const form = reactive({
  nome: '',
  descricao: '',
  data_evento: '',
  hora_evento: '',
  preco: '0',
  vagas: '',
  categoria_id: '',
  local_id: '',
  endereco: '',
})
const banner = ref(null) // arquivo escolhido agora
const bannerAtual = ref(null) // URL do banner já salvo (edição)
const removerBanner = ref(false)

const categorias = ref([])
const locais = ref([])
const carregando = ref(true)
const salvando = ref(false)
const erros = ref({})
const erroForm = ref('')

const opcoesCategorias = computed(() =>
  categorias.value.map((categoria) => ({ value: categoria.id, label: categoria.nome })),
)
const opcoesLocais = computed(() =>
  locais.value.map((local) => ({ value: local.id, label: local.nome })),
)
const localSelecionado = computed(() => locais.value.find((l) => l.id === form.local_id))

onMounted(async () => {
  try {
    const [listaCategorias, listaLocais] = await Promise.all([listarCategorias(), listarLocais()])
    categorias.value = listaCategorias
    locais.value = listaLocais

    if (editando) {
      const evento = await buscarEvento(id)
      Object.assign(form, {
        nome: evento.nome,
        descricao: evento.descricao,
        data_evento: evento.data_evento,
        hora_evento: evento.hora_evento,
        preco: String(evento.preco),
        vagas: String(evento.vagas),
        categoria_id: evento.categoria_id,
        local_id: evento.local_id,
        endereco: evento.endereco_evento ?? '',
      })
      bannerAtual.value = evento.banner_url
    }
  } catch (error) {
    erroForm.value = errorMessage(error, 'Não foi possível carregar os dados do formulário.')
  } finally {
    carregando.value = false
  }
})

async function salvar() {
  salvando.value = true
  erros.value = {}
  erroForm.value = ''

  // Multipart (FormData) porque o formulário envia um arquivo. Campos vazios vão como texto
  // vazio: o Laravel converte para null (assim dá para limpar o endereço, por exemplo).
  const dados = new FormData()
  for (const [campo, valor] of Object.entries(form)) {
    dados.append(campo, valor ?? '')
  }
  if (banner.value) dados.append('banner', banner.value)
  if (removerBanner.value) dados.append('remover_banner', '1')

  try {
    const evento = editando ? await atualizarEvento(id, dados) : await criarEvento(dados)
    router.push({ name: 'evento', params: { id: evento.id } })
  } catch (error) {
    erros.value = validationErrors(error)
    if (!Object.keys(erros.value).length) erroForm.value = errorMessage(error)
  } finally {
    salvando.value = false
  }
}
</script>

<template>
  <AppLayout>
    <h1 class="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">
      {{ editando ? 'Editar evento' : 'Novo evento' }}
    </h1>

    <p v-if="carregando" class="text-sm text-slate-500">Carregando…</p>

    <form v-else class="max-w-3xl space-y-6" @submit.prevent="salvar">
      <UiAlert v-if="erroForm" variant="error">{{ erroForm }}</UiAlert>

      <UiCard title="Dados do evento">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <UiField v-model="form.nome" label="Nome" required :error="erros.nome" />
          </div>
          <div class="sm:col-span-2">
            <UiTextarea
              v-model="form.descricao"
              label="Descrição"
              required
              :error="erros.descricao"
            />
          </div>
          <UiField
            v-model="form.data_evento"
            label="Data"
            type="date"
            required
            :error="erros.data_evento"
          />
          <UiField
            v-model="form.hora_evento"
            label="Hora"
            type="time"
            required
            :error="erros.hora_evento"
          />
          <UiField
            v-model="form.preco"
            label="Preço (R$) — use 0 para gratuito"
            type="number"
            step="0.01"
            min="0"
            required
            :error="erros.preco"
          />
          <UiField
            v-model="form.vagas"
            label="Quantidade de vagas"
            type="number"
            step="1"
            min="1"
            required
            :error="erros.vagas"
          />
        </div>
      </UiCard>

      <UiCard title="Categoria e local">
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <UiSelect
              v-model="form.categoria_id"
              label="Categoria"
              placeholder="Selecione a categoria"
              :options="opcoesCategorias"
              required
              :error="erros.categoria_id"
            />
            <RouterLink
              :to="{ name: 'categorias' }"
              class="mt-1 inline-block text-xs text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Gerenciar categorias
            </RouterLink>
          </div>
          <div>
            <UiSelect
              v-model="form.local_id"
              label="Local"
              placeholder="Selecione o local"
              :options="opcoesLocais"
              required
              :error="erros.local_id"
            />
            <RouterLink
              :to="{ name: 'locais' }"
              class="mt-1 inline-block text-xs text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Gerenciar locais
            </RouterLink>
          </div>
          <div class="sm:col-span-2">
            <UiField
              v-model="form.endereco"
              label="Endereço (opcional)"
              :placeholder="localSelecionado?.endereco || 'Se vazio, usa o endereço do local'"
              :error="erros.endereco"
            />
            <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Se ficar vazio, o endereço do local selecionado é usado.
            </p>
          </div>
        </div>
      </UiCard>

      <UiCard title="Banner">
        <UiImageUpload
          v-model="banner"
          v-model:remover="removerBanner"
          label="Foto do evento"
          :url-atual="bannerAtual"
          :error="erros.banner"
        />
      </UiCard>

      <div class="flex gap-3">
        <UiButton type="submit" :loading="salvando">
          {{ editando ? 'Salvar alterações' : 'Cadastrar evento' }}
        </UiButton>
        <UiButton variant="secondary" @click="router.back()">Cancelar</UiButton>
      </div>
    </form>
  </AppLayout>
</template>
