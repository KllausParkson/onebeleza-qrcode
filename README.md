# OneBeleza QrCode

Gerador de QR Codes dinâmicos para clientes One Beleza — com welcome screens personalizadas em `qrco.one/:slug`.

## Estrutura

```
onebeleza-qrcode/
├── apps/
│   ├── web/          # Next.js 14 — painel admin + welcome pages públicas (Vercel)
│   └── api/          # Hono/Node.js — API REST (Render)
├── packages/
│   └── shared/       # Tipos TypeScript compartilhados
└── supabase/
    └── schema.sql    # Schema SQL completo do Supabase
```

## Tipos de QR Code

### APP Base
Links do One Beleza pré-configurados (Android + iOS). O operador define:
- Nome do cliente
- Slug da URL (`qrco.one/nome-cliente`)
- Logo, cores, título, descrição da welcome screen

### APP Exclusivo
Totalmente customizável (similar ao qr-code-generator.com):
- Nome do app e desenvolvedor
- Logo próprio (180×180 px)
- Links para App Store, Google Play e/ou Amazon
- Cores, título, descrição, website
- Botões de ação customizados
- Welcome screen com splash logo

## Setup

### 1. Supabase
1. Crie um projeto em [supabase.com](https://supabase.com)
2. Execute `supabase/schema.sql` no SQL Editor
3. Crie o bucket de storage `qrcode-assets` (público)
4. Copie a URL e as chaves (anon + service_role)

### 2. Variáveis de ambiente

**apps/web** — copie `.env.example` para `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_PUBLIC_URL=https://qrco.one
```

**apps/api** — copie `.env.example` para `.env`:
```
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_ANON_KEY=...
PUBLIC_URL=https://qrco.one
ALLOWED_ORIGINS=http://localhost:3000
```

### 3. Instalar dependências
```bash
pnpm install
```

### 4. Rodar em desenvolvimento
```bash
# Ambas as apps
pnpm dev

# Só o frontend
pnpm dev:web

# Só a API
pnpm dev:api
```

Acesse:
- Painel admin: http://localhost:3000
- API: http://localhost:3001

## Deploy

### Vercel (frontend)
1. Importe o repositório no Vercel
2. Set root directory: `apps/web`
3. Configure as variáveis de ambiente (NEXT_PUBLIC_*)
4. Configure o domínio `qrco.one`

### Render (API)
1. Crie um Web Service no Render
2. Aponte para o repositório, root: `apps/api`
3. Build: `pnpm install && pnpm build`
4. Start: `node dist/index.js`
5. Configure as variáveis de ambiente

## URL pública

Cada QR Code gera uma URL `qrco.one/:slug`. O slug é gerado automaticamente a partir do nome do cliente, mas pode ser personalizado. A welcome screen:

- Detecta o sistema operacional do usuário (iOS/Android)
- Exibe o botão da loja correta em destaque
- Mostra splash screen animada se configurada
- Suporta Open Graph para compartilhamento

## Tech Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Hono, Node.js, TypeScript |
| Banco | Supabase (PostgreSQL + Storage + Auth) |
| Deploy Frontend | Vercel |
| Deploy API | Render |
