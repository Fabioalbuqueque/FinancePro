# FinancePro

Aplicativo de gestão financeira pessoal e familiar com controle de receitas, despesas, metas e orçamentos.

## 📋 Funcionalidades

- **Autenticação**: Login, cadastro e recuperação de senha com Firebase
- **Dashboard**: Saldo total, receitas, despesas e últimas transações
- **Transações**: Receitas, despesas e transferências entre contas
- **Contas**: Contas individuais e familiares (corrente, poupança, espécie, digital)
- **Famílias**: Grupos compartilhados com permissões (admin/membro)
- **Categorias**: Padrão e personalizadas para organizar transações
- **Relatórios**: Análise mensal por categoria
- **Metas**: Objetivos financeiros com progresso
- **Orçamento**: Controle de gastos mensais
- **Tema**: Claro, escuro ou automático

## 🏗️ Arquitetura

```
FinancePro/
├── backend/          # API REST NestJS
│   ├── src/
│   │   ├── auth/     # Autenticação Firebase
│   │   ├── users/    # Perfis de usuário
│   │   ├── families/ # Grupos familiares
│   │   ├── accounts/ # Contas financeiras
│   │   ├── transactions/ # Movimentações
│   │   ├── categories/   # Categorias
│   │   ├── dashboard/    # Indicadores
│   │   ├── reports/      # Relatórios
│   │   ├── budgets/      # Orçamentos
│   │   └── goals/        # Metas
│   ├── test/         # Testes
│   └── package.json
├── financepro/       # App React Native (Expo)
│   ├── app/          # Telas e navegação
│   ├── src/          # Componentes e serviços
│   └── package.json
├── docs/             # Documentação
│   ├── IDEA.md
│   ├── SPEC.md
│   ├── REQUIREMENTS.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   └── STATUS.md
└── README.md
```

## 🚀 Começando

### Pré-requisitos

- Node.js 18+
- MongoDB Atlas (ou local)
- Firebase (Auth e Admin)

### 1. Configurar Backend

```bash
cd backend
npm install
```

### 2. Configurar variáveis de ambiente

Copie `.env.example` para `.env` e configure:

```env
NODE_ENV=development
PORT=3000

# MongoDB
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/financepro?retryWrites=true&w=majority

# Firebase Admin
FIREBASE_SERVICE_ACCOUNT_PATH=firebase-service-account.json
```

### 3. Configurar Firebase Admin

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Vá em "Configurações do Projeto" → "Service accounts"
3. Clique em "Gerenciar service accounts"
4. Baixe a chave JSON e salve em `backend/firebase-service-account.json`

### 4. Iniciar Backend

```bash
npm run start:dev
```

A API estará disponível em `http://localhost:3000`
Swagger em `http://localhost:3000/api/docs`

### 5. Configurar Frontend

```bash
cd financepro
npm install
```

Configure o IP local no `src/services/api.ts`:

```typescript
export const API_BASE_URL = 'http://SEU_IP_LOCAL:3000';
```

### 6. Iniciar Frontend

```bash
npm start
```

O app Expo será iniciado em `http://localhost:8081`

## 🧪 Testes

### Backend

```bash
cd backend
npm test
```

### Frontend

```bash
cd financepro
npm run web  # Para testar no navegador
npm run android  # Para testar no Android
npm run ios  # Para testar no iOS
```

## 🔧 Variáveis de Ambiente

### Backend (.env)

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| NODE_ENV | Ambiente de execução | development |
| PORT | Porta do servidor | 3000 |
| MONGODB_URI | Conexão com MongoDB | mongodb+srv://... |
| FIREBASE_SERVICE_ACCOUNT_PATH | Caminho da chave | firebase-service-account.json |

### Frontend (.env)

| Variável | Descrição |
|----------|-----------|
| EXPO_PUBLIC_FIREBASE_API_KEY | Chave da API Firebase |
| EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN | Domínio de autenticação |
| EXPO_PUBLIC_FIREBASE_PROJECT_ID | ID do projeto |

## 📚 Documentação

- [IDEA.md](docs/IDEA.md) - Conceito do produto
- [SPEC.md](docs/SPEC.md) - Especificação do sistema
- [REQUIREMENTS.md](docs/REQUIREMENTS.md) - Requisitos
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Arquitetura
- [DATABASE.md](docs/DATABASE.md) - Banco de dados
- [STATUS.md](docs/STATUS.md) - Status da v1.0

## 🔐 Segurança

- Autenticação via Firebase Auth
- Autorização por token JWT
- Isolamento entre usuários e famílias
- Permissões: admin (gerencia) e membro (utiliza)
- Auditoria de operações financeiras

## 📊 API

Endpoints principais:

- `GET /users/me` - Perfil do usuário
- `PATCH /users/me` - Atualizar perfil
- `POST /families` - Criar família
- `GET /families/current` - Família atual
- `POST /accounts` - Criar conta
- `GET /accounts` - Listar contas
- `POST /transactions` - Criar transação
- `GET /transactions` - Listar transações
- `GET /dashboard` - Dashboard
- `GET /reports/monthly` - Relatório mensal
- `POST /budgets` - Criar orçamento
- `POST /goals` - Criar meta

## 🛠️ Build para Produção

### Android/iOS com Expo EAS

```bash
cd financepro
npm install -g eas-cli
eas login
eas build --platform android
eas build --platform ios
```

### Backend

```bash
cd backend
npm run build
npm run start:prod
```

## 📄 Licença

Projeto em desenvolvimento - FinancePro v1.0

## 🤝 Contribuindo

Este é um projeto em fase de MVP. Sugestões e melhorias são bem-vindas!

---

**FinancePro** - Gestão financeira inteligente, pessoal e familiar 💰
