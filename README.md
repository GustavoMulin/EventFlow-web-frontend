# EventFlow — Front-end (Vue 3)

Interface web do sistema **EventFlow** (gerenciamento e divulgação de eventos). É uma SPA em **Vue 3** que consome a
API Laravel do repositório `EventFlow-web-back`.

## Por que Vue 3

- Framework padrão da turma, com **componentes reativos**, **roteador** e **gerenciador de estado** oficiais.
- `<script setup>` deixa os componentes curtos e fáceis de explicar.
- Separa bem as responsabilidades: **páginas** (views), **componentes** reutilizáveis, **serviços** de API e **store**.
- Vite: ambiente de desenvolvimento rápido (atualização instantânea no navegador).

## Telas × rotas × arquivos

| Tela | Rota | Acesso | Arquivo |
| --- | --- | --- | --- |
| Login | `/login` | visitante | `views/auth/LoginView.vue` |
| Criar conta | `/registrar` | visitante | `views/auth/RegistrarView.vue` |
| **Lista de Eventos** (nome, data, preço, categoria, miniatura + busca) | `/eventos` | público | `views/eventos/EventosView.vue` |
| **Mapa de Eventos** (marcadores, popup, "Ver detalhes") | `/mapa` | público | `views/mapa/MapaView.vue` |
| **Detalhe do Evento** (banner, mapa, inscrição, PDF) | `/eventos/:id` | público | `views/eventos/EventoDetalheView.vue` |
| **Cadastro / Edição de Evento** (categoria, local, upload de foto) | `/eventos/novo` · `/eventos/:id/editar` | logado | `views/eventos/EventoFormView.vue` |
| **Categorias** (listar, criar, editar, excluir) | `/categorias` | logado | `views/categorias/CategoriasView.vue` |
| **Locais** (listar, criar, editar, excluir + busca de endereço) | `/locais` | logado | `views/locais/LocaisView.vue` |
| **Perfil** (dados do usuário + Sair) | `/perfil` | logado | `views/perfil/PerfilView.vue` |

Visitantes podem ver a lista, o mapa e os detalhes e **se inscrever** (recebendo o ingresso em PDF). As áreas de
gestão exigem login (guard no roteador).

## Organização das pastas

```
src/
├── main.js · App.vue
├── router/index.js        todas as rotas + guards (requiresAuth / guestOnly)
├── stores/auth.js         sessão (Pinia): usuário logado e token
├── lib/                   api.js (axios) · formatadores.js (moeda/data) · leaflet.js (config do mapa)
├── services/              1 arquivo por recurso da API: eventos · categorias · locais · inscricoes · geocodificacao
├── layouts/               GuestLayout (telas sem login) · AppLayout (menu + Sair)
├── components/
│   ├── ui/                Ui* genéricos: Button, Field, Select, Textarea, ImageUpload, Modal, Pagination, Alert, Card
│   ├── eventos/           EventoCard
│   └── mapa/              MapaEventos (marcadores) · MapaLocal (escolher posição)
└── views/                 uma pasta por área, uma tela por arquivo
```

Regra para se achar: **chamada de API** → `services/` · **tela** → `views/<área>/` · **componente reutilizável** →
`components/ui/` · **rotas** → `router/index.js`.

## Integração com a API (auth + eventos)

- `lib/api.js` cria uma instância do **axios** com `baseURL = VITE_API_URL + '/api'`.
- **Autenticação por token (Sanctum):** o login devolve um token; ele fica no `localStorage` e um *interceptor* de
  requisição o envia em `Authorization: Bearer …`. Se a API responde `401`, o interceptor limpa a sessão.
- `stores/auth.js` guarda o usuário e, ao abrir/atualizar a página, restaura a sessão chamando `GET /api/user`
  (mantém o usuário logado).
- O roteador (`router/index.js`) bloqueia as rotas `requiresAuth` para visitantes (redireciona ao login) e as
  rotas `guestOnly` para quem já está logado.
- Cada tela usa um **serviço** (`services/*.js`) — nenhuma tela chama o axios direto. Erros de validação (`422`)
  chegam por campo e aparecem sob cada input (`validationErrors`).
- **Upload:** o formulário de evento envia `FormData` (`multipart`). Na edição usa `POST` + `_method=PUT`.
- **PDF:** o ingresso é pedido como *blob* (`responseType: 'blob'`) e baixado pelo navegador.

## Bibliotecas e a função de cada uma

| Biblioteca | Função |
| --- | --- |
| **vue** 3 | Framework de interface (componentes reativos) |
| **vue-router** | Rotas, navegação e guards de acesso |
| **pinia** | Estado global (sessão do usuário) |
| **axios** | Requisições HTTP à API, com interceptors (token e 401) |
| **leaflet** | Biblioteca de **mapas** (marcadores, popups, cliques) |
| **OpenStreetMap** (tiles) | Imagens do mapa exibidas pelo Leaflet — gratuito, sem chave |
| **Nominatim** (API do OpenStreetMap) | **Busca de endereço** → latitude/longitude (geocodificação) |
| **tailwindcss** 4 | Estilização por classes utilitárias, incluindo tema escuro e responsividade |
| **vite** | Servidor de desenvolvimento e build |
| ESLint · oxlint · Prettier | Análise de código e padronização |

## Como rodar

```bash
npm install
cp .env.example .env      # VITE_API_URL: com Docker/Sail use http://localhost ; com artisan serve use http://localhost:8000
npm run dev               # http://localhost:5173
```

O back-end precisa estar no ar (veja o README do `EventFlow-web-back`). Usuário de demonstração:
**test@example.com** / **password**.

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção (`dist/`) |
| `npm run lint` | oxlint + ESLint (com correção automática) |
| `npm run format` | Prettier em `src/` |
