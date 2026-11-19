REQUIREMENTS.md
Documento em elaboração concluído
Versão 1.0.0

1. Identificação do projeto
Campo	Definição
Nome	FinancePro
Versão	1.0.0
Tipo	Aplicativo financeiro
Público	Individual e familiar
Plataformas	Android e iOS
Idiomas inicial	Português brasileiro
Moeda padrão	BRL
Tema	Claro e escuro
Backend	NestJS + Node.js
Banco	MongoDB Atlas
Autenticação	Firebase Auth

2. Requisitos funcionais
RF-001 — Cadastro de usuários
O sistema deverá permitir:
- Cadastro com nome, e-mail e senha.
- Validação dos dados.
- Verificação de e-mail.
- Criação de perfil financeiro.
- Identificação única por Firebase UID.
Critérios de aceitação:
- Não permitir e-mails duplicados.
- Não criar perfis incompletos.
- Não armazenar senhas no MongoDB.
- Impedir acesso sem autenticação.
RF-002 — Login
O sistema deverá permitir autenticação por e-mail e senha.
- Login pelo Firebase Authentication.
- Recuperação de senha.
- Persistência de sessão.
- Logout.
- Proteção das telas internas.
RF-003 — Dashboard
O dashboard deverá apresentar:
Indicador	Descrição
Saldo total	Soma dos saldos das contas
Receitas	Entradas do período
Despesas	Saídas do período
Resultado	Receitas menos despesas
Gráfico	Evolução financeira
Histórico	Últimas movimentações

O usuário poderá selecionar o período de visualização.
RF-004 — Receitas
Permitir cadastrar receitas com:
- Descrição.
- Valor.
- Categoria.
- Conta de destino.
- Data de recebimento.
- Responsável pelo lançamento.
RF-005 — Despesas
Permitir cadastrar despesas com:
- Descrição.
- Valor.
- Categoria.
- Conta de origem.
- Data.
- Status: pendente ou paga.
- Responsável pelo lançamento.
RF-006 — Contas financeiras
O sistema deverá permitir criar e gerenciar contas como:
- Dinheiro em espécie.
- Conta corrente.
- Conta poupança.
- Carteira digital.
Cada conta terá seu próprio saldo calculado a partir das movimentações confirmadas e dos ajustes autorizados.
RF-007 — Categorias
Categorias iniciais:

Receitas
- Salário.
- Freelance.
- Investimentos.
- Outros recebimentos.
Despesas
- Moradia.
- Alimentação.
- Transporte.
- Saúde.
- Educação.
- Lazer.
- Contas.
- Outros.
RF-008 — Gestão familiar
O administrador poderá:
- Criar grupo familiar.
- Definir nome do grupo.
- Convidar participantes.
- Remover participantes.
- Consultar todos os lançamentos familiares.
- Administrar contas compartilhadas.
Os membros poderão visualizar as informações financeiras compartilhadas e registrar suas próprias movimentações no grupo.
RF-009 — Relatórios
- Despesas por categoria.
- Receitas por período.
- Comparação mensal.
- Histórico de saldo.
- Relatório familiar.
RF-010 — Preferências
- Tema claro.
- Tema escuro.
- Formato monetário brasileiro.
- Preferências de notificação.
- Configurações do perfil.

3. Matriz de permissões
Vamos trabalhar com dois papéis: administrador e membro.
Funcionalidade	Administrador	Membro
Visualizar finanças familiares	Sim	Sim
Visualizar contas compartilhadas	Sim	Sim
Cadastrar movimentações	Sim	Sim
Editar próprios lançamentos	Sim	Sim
Editar lançamentos de outros	Sim	Não
Excluir lançamentos de outros	Sim	Não
Convidar participantes	Sim	Não
Remover participantes	Sim	Não
Alterar configurações familiares	Sim	Não
Administrar permissões	Sim	Não

Regra de privacidade: todos visualizam as informações financeiras do grupo familiar, mas dados pessoais de autenticação e perfil não são compartilhados.
4. Regras de negócio
Código	Regra
RN-001	Todo usuário deve possuir identificação única.
RN-002	Toda movimentação pertence a um usuário responsável.
RN-003	Movimentações familiares pertencem a um grupo.
RN-004	Todos os membros autorizados visualizam as movimentações do grupo.
RN-005	Apenas administradores gerenciam participantes.
RN-006	Membros não podem alterar lançamentos de terceiros.
RN-007	Receitas aumentam o saldo da conta.
RN-008	Despesas pagas diminuem o saldo da conta.
RN-009	Despesas pendentes não alteram o saldo disponível.
RN-010	Transferências não são contabilizadas como receitas ou despesas.
RN-011	Valores monetários são armazenados em centavos inteiros.
RN-012	Operações financeiras devem ser validadas pelo backend.

5. Requisitos não funcionais
Código	Requisito	Critério
RNF-001	Segurança	Autenticação obrigatória
RNF-002	Privacidade	Isolamento entre famílias
RNF-003	Desempenho	Paginação de históricos
RNF-004	Compatibilidade	Android e iOS
RNF-005	Escalabilidade	Backend modular
RNF-006	Integridade	Transações consistentes
RNF-007	Manutenção	TypeScript e testes
RNF-008	Usabilidade	Layout responsivo
RNF-009	Disponibilidade	Tratamento de falhas de conexão
RNF-010	Auditoria	Registro de alterações relevantes

6. Modelo inicial de dados
A estrutura abaixo será a referência para o DATABASE.md.

type User = {
  _id: string;
  firebaseUid: string;
  name: string;
  email: string;
  createdAt: Date;
};

type Family = {
  _id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
};

type FamilyMember = {
  _id: string;
  familyId: string;
  userId: string;
  role: "admin" | "member";
  status: "active" | "pending" | "removed";
};

type Account = {
  _id: string;
  ownerId: string;
  familyId?: string;
  name: string;
  type: "cash" | "checking" | "savings" | "digital";
  initialBalanceCents: number;
  createdAt: Date;
};

type Transaction = {
  _id: string;
  userId: string;
  familyId?: string;
  accountId: string;
  type: "income" | "expense" | "transfer";
  amountCents: number;
  categoryId?: string;
  description: string;
  status: "pending" | "paid";
  date: Date;
  createdAt: Date;
  updatedAt: Date;
};



Decisões importantes para a implementação:
- firebaseUid será único e indexado.
- familyId determinará o contexto compartilhado.
- Contas familiares terão acesso controlado pela associação ao grupo.
- Toda consulta familiar verificará a participação ativa do usuário.
- Exclusões financeiras deverão preservar histórico de auditoria.
- Transferências terão débito e crédito vinculados, registrados atomicamente.
7. API inicial
A API será organizada por módulos.
Método	Endpoint	Responsabilidade
GET	/users/me	Perfil autenticado
PATCH	/users/me	Atualizar perfil
POST	/families	Criar família
GET	/families/current	Consultar família
POST	/families/invitations	Convidar membro
GET	/families/members	Listar participantes
POST	/accounts	Criar conta
GET	/accounts	Listar contas
POST	/transactions	Criar lançamento
GET	/transactions	Listar lançamentos
PATCH	/transactions/:id	Editar lançamento
DELETE	/transactions/:id	Excluir lançamento
GET	/dashboard	Consultar indicadores
GET	/reports/monthly	Relatório mensal

Todos os endpoints financeiros serão protegidos por autenticação e autorização.
8. Critérios de conclusão da versão 1.0
A versão inicial somente será considerada pronta quando:
- [ ] Cadastro e login funcionarem.
- [ ] Recuperação de senha funcionar.
- [ ] Dashboard apresentar dados reais do MongoDB.
- [ ] Receitas forem registradas corretamente.
- [ ] Despesas forem registradas corretamente.
- [ ] Saldos forem consistentes.
- [ ] Transferências não duplicarem receitas ou despesas.
- [ ] Gestão familiar funcionar.
- [ ] Permissões forem respeitadas.
- [ ] Modo claro e escuro funcionarem.
- [ ] Testes de segurança forem aprovados.
- [ ] Aplicativo funcionar em Android e iOS.

9. Preparação da implementação
Minha recomendação é utilizar esta estrutura definitiva:
FinancePro/
│
├── apps/
│   └── mobile/
│       ├── app/
│       ├── src/
│       │   ├── components/
│       │   ├── features/
│       │   ├── hooks/
│       │   ├── services/
│       │   ├── theme/
│       │   ├── navigation/
│       │   └── types/
│       └── package.json
│
├── backend/
│   └── src/
│       ├── auth/
│       ├── users/
│       ├── families/
│       ├── accounts/
│       ├── transactions/
│       ├── dashboard/
│       ├── reports/
│       ├── common/
│       └── main.ts
│
├── docs/
│   ├── IDEA.md
│   ├── SPEC.md
│   ├── REQUIREMENTS.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── DESIGN.md
│   ├── USE_CASES.md
│   ├── BUSINESS_RULES.md
│   ├── TASKS.md
│   └── TEST_PLAN.md
│
└── README.md


Ordem de desenvolvimento
1. ARCHITECTURE.md
   
   Definir módulos, comunicação, autenticação e infraestrutura.
2. DATABASE.md
   
   Definir collections, relacionamentos, índices e integridade.
3. DESIGN.md
   
   Definir cores, tipografia, componentes e navegação.
4. CODING_STANDARDS.md e TEST_PLAN.md
   
   Estabelecer padrões de código e testes.
5. TASKS.md
   
   Dividir o desenvolvimento em tarefas executáveis.
6. Implementação
   
   Construir o aplicativo e o backend, módulo por módulo.
10. Decisão antes de começar a programar
Temos uma definição importante: o FinancePro será um aplicativo com finanças individuais e familiares, e não apenas um controle de despesas.

A estrutura permitirá que cada pessoa tenha sua área particular e participe de um ambiente familiar compartilhado. Dentro do grupo, todos poderão visualizar as finanças, mas somente o administrador poderá administrar os participantes e modificar lançamentos de terceiros.

Status do projeto:
IDEA.md
Concluído

SPEC.md
Concluído

REQUIREMENTS.md
Concluído

ARCHITECTURE.md
Próximo

DATABASE.md
Planejado

Implementação 1.0
Não iniciada


Próximo passo: desenvolver a documentação ARCHITECTURE.md, definindo a arquitetura completa do React Native, NestJS, Firebase e MongoDB, incluindo autenticação, segurança, comunicação entre módulos e estrutura de implantação.