<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'

const TAMANHO_MAXIMO = 2 * 1024 * 1024 // 2 MB (mesmo limite validado no backend)
const TIPOS = ['image/jpeg', 'image/png', 'image/webp']

const props = defineProps({
  label: { type: String, default: 'Imagem' },
  // Arquivo escolhido agora (File) — o pai guarda com v-model.
  modelValue: { type: Object, default: null },
  // URL da imagem já salva no servidor (edição).
  urlAtual: { type: String, default: null },
  // Marcar para remover a imagem já salva.
  remover: { type: Boolean, default: false },
  error: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'update:remover'])

const previa = ref(null)
const erroLocal = ref('')

function liberarPrevia() {
  if (previa.value) URL.revokeObjectURL(previa.value)
  previa.value = null
}

// Gera a pré-visualização do arquivo escolhido e libera a memória da anterior.
watch(
  () => props.modelValue,
  (arquivo) => {
    liberarPrevia()
    if (arquivo) previa.value = URL.createObjectURL(arquivo)
  },
  { immediate: true },
)

onBeforeUnmount(liberarPrevia)

function aoEscolher(evento) {
  erroLocal.value = ''
  const arquivo = evento.target.files?.[0]
  if (!arquivo) return

  if (!TIPOS.includes(arquivo.type)) {
    erroLocal.value = 'Use uma imagem JPG, PNG ou WEBP.'
  } else if (arquivo.size > TAMANHO_MAXIMO) {
    erroLocal.value = 'A imagem deve ter no máximo 2 MB.'
  } else {
    emit('update:modelValue', arquivo)
    emit('update:remover', false)
  }
  evento.target.value = '' // permite escolher o mesmo arquivo novamente
}

function descartar() {
  emit('update:modelValue', null)
}
</script>

<template>
  <div>
    <span v-if="label" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
      {{ label }}
    </span>

    <div
      class="flex aspect-video w-full max-w-md items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
    >
      <img
        v-if="previa"
        :src="previa"
        alt="Pré-visualização do banner"
        class="h-full w-full object-cover"
      />
      <img
        v-else-if="urlAtual && !remover"
        :src="urlAtual"
        alt="Banner atual"
        class="h-full w-full object-cover"
      />
      <span v-else class="text-sm text-slate-400">Nenhuma imagem selecionada</span>
    </div>

    <div class="mt-2 flex flex-wrap items-center gap-3 text-sm">
      <label
        class="cursor-pointer rounded-md bg-white px-3 py-1.5 font-medium text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700"
      >
        Escolher imagem
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          class="sr-only"
          @change="aoEscolher"
        />
      </label>

      <button
        v-if="modelValue"
        type="button"
        class="font-medium text-slate-600 hover:underline dark:text-slate-300"
        @click="descartar"
      >
        Descartar nova imagem
      </button>

      <label
        v-if="urlAtual && !modelValue"
        class="flex items-center gap-2 text-slate-600 dark:text-slate-300"
      >
        <input
          type="checkbox"
          :checked="remover"
          @change="emit('update:remover', $event.target.checked)"
        />
        Remover banner atual
      </label>
    </div>

    <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">JPG, PNG ou WEBP, até 2 MB.</p>
    <span v-if="erroLocal || error" class="mt-1 block text-sm text-red-600 dark:text-red-400">
      {{ erroLocal || error }}
    </span>
  </div>
</template>
