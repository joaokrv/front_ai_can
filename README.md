# AICan — Frontend

Interface web do AICan, plataforma de treino e nutrição personalizada com IA.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 6 |
| Roteamento | React Router v7 |
| Estilo | CSS Modules |
| Charts | Recharts |
| Ícones | Lucide React |
| Animações | Framer Motion |

## Pré-requisitos

- Node.js 20+
- Backend AICan rodando (ver [backend](../backend_ai_can))

## Instalação

```bash
npm install
```

## Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

Em produção, aponte para a URL do backend deployado.

## Desenvolvimento

```bash
npm run dev
```

Acesse `http://localhost:5173`.

## Build de Produção

```bash
npm run build
npm run preview   # testar o build localmente
```

O output vai para `dist/`.

## Estrutura

```
src/
├── components/
│   ├── charts/       # MacroDonut, WeeklyBarChart
│   ├── feedback/     # VoteButtons
│   ├── forms/        # DaySelector, DurationSlider, Stepper
│   ├── layout/       # Sidebar, Header, SearchPalette
│   ├── plano/        # ExerciseRow, MealCard, TrainingCard, StatCard
│   └── ui/           # Badge, Button, Input, Modal, Skeleton, Tabs, Toast
├── layouts/          # AuthLayout, DashboardLayout
├── lib/
│   └── api.ts        # Cliente HTTP com refresh token automático
├── routes/
│   ├── auth/         # Login, Registro
│   ├── dashboard/    # Hoje, Treinos, Exercícios, Refeições, Afinidade, Histórico, Perfil
│   ├── legal/        # Termos, Privacidade
│   └── onboarding/   # Onboarding, Geração de Plano
└── main.tsx
```

## Segurança

- **CSP** via `<meta>` em `index.html` — restringe scripts, fontes e conexões
- **sanitizeUrl()** — valida protocolo antes de renderizar qualquer link externo (bloqueia `javascript:` e `data:` URI)
- **Tokens** — access token em `sessionStorage`, refresh token em `localStorage` (se "lembrar")
- **Refresh automático** — `ApiClient` intercepta 401/403 e rotaciona o token sem interação do usuário
- **Headers de segurança** — `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` via Vite dev server

## Licença

MIT © 2025 João Victor Carvalho
