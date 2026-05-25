# 🧠 AICan — Frontend (Web App)

---

## 📌 Sobre o Projeto

O **AICan Frontend** é a interface web da plataforma de treino e nutrição personalizada com IA.
A aplicação foi criada para oferecer uma experiência fluida e moderna, integrando autenticação,
dashboard de métricas, geração de planos e feedback contínuo ao usuário.

---

## 🏗️ Arquitetura e Componentes

| Componente | Descrição |
|-----------|-----------|
| **React 19 + TypeScript** | UI declarativa, tipagem forte e DX consistente |
| **Vite 6** | Build rápido, HMR eficiente, bundles otimizados |
| **React Router v7** | Rotas aninhadas, layouts e guardas de navegação |
| **CSS Modules** | Estilização escopada por componente |
| **Recharts** | Visualização de métricas e gráficos |
| **Lucide React** | Iconografia consistente |
| **Framer Motion** | Animações e transições suaves |

---

## 📁 Estrutura do Projeto

```
frontend_ai_can/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── eslint.config.js
├── public/
└── src/
	├── assets/
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
	├── stores/           # AuthStore, ToastStore
	├── App.tsx
	├── index.css
	└── main.tsx
```

---

## 🚀 Instalação e Configuração

### Pré-requisitos

- **Node.js 20+**
- **Backend AICan** em execução (ver [backend](../backend_ai_can))

### 1️⃣ Instale as Dependências

```bash
npm install
```

### 2️⃣ Configure as Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

Em produção, aponte para a URL do backend deployado.

### 3️⃣ Execute o Frontend

```bash
npm run dev
```

Acesse: `http://localhost:5173`

---

## 📦 Build de Produção

```bash
npm run build
npm run preview   # testar o build localmente
```

O output vai para `dist/`.

---

## 🧭 Rotas e Navegação

Principais grupos de rotas:

- **Auth**: `/auth/*`
- **Dashboard**: `/dashboard/*`
- **Onboarding**: `/onboarding/*`
- **Legal**: `/legal/*`
- **Fallback**: `*` (NotFound)

Os layouts são organizados em **AuthLayout** e **DashboardLayout** para consistência visual e
controle de acesso.

---

## 🔌 Integração com API

O cliente HTTP fica em `src/lib/api.ts` e oferece:

- **Refresh automático** de tokens (intercepta 401/403)
- **Base URL configurável** via `VITE_API_URL`
- **Erros normalizados** para UI (toast, fallback, redirect)

---

## 🔐 Segurança

- **CSP** via `<meta>` em `index.html` — restringe scripts, fontes e conexões
- **sanitizeUrl()** — valida protocolo antes de renderizar links externos (bloqueia `javascript:` e `data:`)
- **Tokens** — access token em `sessionStorage`, refresh token em `localStorage` (se "lembrar")
- **Headers de segurança** — `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` via Vite dev server

---

## 📦 Scripts Disponíveis

```bash
npm run dev       # desenvolvimento com HMR
npm run build     # build de produção
npm run preview   # preview do build
npm run lint      # lint com ESLint
```

---

## 📚 Dependências Principais

```txt
# Core
react@19
react-dom@19
typescript@5

# Build
vite@6

# UI
react-router@7
framer-motion
recharts
lucide-react
```

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/MinhaFeature`
3. Faça commits descritivos: `git commit -m 'Adiciona MinhaFeature'`
4. Push para a branch: `git push origin feature/MinhaFeature`
5. Abra um Pull Request com descrição clara

---

## 📄 Licença

MIT © 2025 João Victor Carvalho
