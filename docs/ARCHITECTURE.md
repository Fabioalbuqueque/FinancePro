ARCHITECTURE.md
Documento arquitetural
v1.0.0

1. Objetivo da arquitetura
Construir uma aplicação financeira multiplataforma com arquitetura modular, segura e preparada para expansão.

A arquitetura deverá permitir:
- Desenvolvimento independente do mobile e backend.
- Separação entre interface, regras de negócio e persistência.
- Autenticação centralizada.
- Controle financeiro individual e familiar.
- Isolamento dos dados entre usuários e famílias.
- Evolução futura sem grandes alterações estruturais.
2. Arquitetura geral
Adotaremos inicialmente uma arquitetura de monólito modular no backend.

Isso significa que teremos uma única API, organizada em módulos independentes, em vez de vários microsserviços.

É uma decisão mais adequada para a primeira versão: reduz custos, complexidade operacional e facilita manutenção.
FinancePro Mobile

React Native • Expo • TypeScript

Android / iOS

API REST

HTTPS • JSON • JWT Firebase

Backend NestJS
Auth


Users


Families


Accounts


Transactions


Categories


Dashboard


Reports




MongoDB Atlas

Dados financeiros


Firebase

Auth e notificações




3. Arquitetura mobile
Tecnologias definidas:
Tecnologia	Utilização
React Native	Interface mobile
Expo	Ambiente de desenvolvimento
TypeScript	Linguagem
Expo Router	Navegação
TanStack Query	Dados da API e cache
Zustand	Estado global da interface
React Hook Form	Formulários
Zod	Validação
Firebase SDK	Autenticação

Organização mobile
apps/mobile/
├── app/
│   ├── (auth)/
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   │
│   ├── (tabs)/
│   │   ├── index.tsx
│   │   ├── transactions.tsx
│   │   ├── accounts.tsx
│   │   ├── family.tsx
│   │   └── profile.tsx
│   │
│   └── _layout.tsx
│
└── src/
    ├── components/
    ├── features/
    ├── services/
    ├── hooks/
    ├── stores/
    ├── theme/
    ├── schemas/
    ├── types/
    └── utils/


Navegação
O usuário não autenticado terá acesso somente às telas de autenticação.

Após autenticar, será direcionado ao dashboard.

A navegação inferior terá cinco áreas:
1. Início.
2. Transações.
3. Contas.
4. Família.
5. Perfil.
4. Arquitetura do backend
Utilizaremos NestJS com módulos independentes.
backend/src/
├── auth/
├── users/
├── families/
├── family-members/
├── invitations/
├── accounts/
├── transactions/
├── categories/
├── dashboard/
├── reports/
├── notifications/
├── common/
│   ├── guards/
│   ├── decorators/
│   ├── filters/
│   ├── interceptors/
│   └── validators/
├── config/
├── database/
└── main.ts


Responsabilidade dos módulos
Módulo	Responsabilidade
Auth	Validar identidade
Users	Gerenciar usuários
Families	Gerenciar grupos
Family Members	Administrar participantes
Invitations	Convites familiares
Accounts	Contas e saldos
Transactions	Movimentações
Categories	Categorias
Dashboard	Indicadores
Reports	Relatórios
Notifications	Notificações

5. Autenticação e segurança
O Firebase Authentication será responsável pela identidade dos usuários.

Fluxo:
MongoDBAPI NestJSFirebaseMobileUsuárioMongoDBAPI NestJSFirebaseMobileUsuário#chatgpt-mermaid-_r_24i_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(13, 13, 13);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-_r_24i_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-_r_24i_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-_r_24i_ .error-icon{fill:rgb(243, 243, 243);}#chatgpt-mermaid-_r_24i_ .error-text{fill:rgb(13, 13, 13);stroke:rgb(13, 13, 13);}#chatgpt-mermaid-_r_24i_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-_r_24i_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-_r_24i_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-_r_24i_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-_r_24i_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-_r_24i_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-_r_24i_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-_r_24i_ .marker.cross{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-_r_24i_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-_r_24i_ p{margin:0;}#chatgpt-mermaid-_r_24i_ .actor{stroke:rgb(83, 154, 248);fill:rgb(222, 234, 251);stroke-width:1;}#chatgpt-mermaid-_r_24i_ rect.actor.outer-path[data-look="neo"]{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_24i_ rect.note[data-look="neo"]{stroke:rgb(107, 198, 127);fill:rgb(243, 243, 243);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_24i_ text.actor>tspan{fill:rgb(13, 13, 13);stroke:none;}#chatgpt-mermaid-_r_24i_ .actor-line{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-_r_24i_ .innerArc{stroke-width:1.5;stroke-dasharray:none;}#chatgpt-mermaid-_r_24i_ .messageLine0{stroke-width:1.5;stroke-dasharray:none;stroke:rgb(143, 143, 143);}#chatgpt-mermaid-_r_24i_ .messageLine1{stroke-width:1.5;stroke-dasharray:2,2;stroke:rgb(143, 143, 143);}#chatgpt-mermaid-_r_24i_ [id$="-arrowhead"] path{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-_r_24i_ .sequenceNumber{fill:#707070;}#chatgpt-mermaid-_r_24i_ [id$="-sequencenumber"]{fill:rgb(143, 143, 143);}#chatgpt-mermaid-_r_24i_ [id$="-crosshead"] path{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-_r_24i_ .messageText{fill:rgb(13, 13, 13);stroke:none;}#chatgpt-mermaid-_r_24i_ .labelBox{stroke:rgba(0, 0, 0, 0.1);fill:rgb(252, 252, 252);filter:none;}#chatgpt-mermaid-_r_24i_ .labelText,#chatgpt-mermaid-_r_24i_ .labelText>tspan{fill:rgb(13, 13, 13);stroke:none;}#chatgpt-mermaid-_r_24i_ .loopText,#chatgpt-mermaid-_r_24i_ .loopText>tspan{fill:rgb(13, 13, 13);stroke:none;}#chatgpt-mermaid-_r_24i_ .sectionTitle,#chatgpt-mermaid-_r_24i_ .sectionTitle>tspan{fill:rgb(13, 13, 13);stroke:none;}#chatgpt-mermaid-_r_24i_ .loopLine{stroke-width:2px;stroke-dasharray:2,2;stroke:rgba(0, 0, 0, 0.1);fill:rgba(0, 0, 0, 0.1);}#chatgpt-mermaid-_r_24i_ .note{stroke:rgb(107, 198, 127);fill:rgb(243, 243, 243);}#chatgpt-mermaid-_r_24i_ .noteText,#chatgpt-mermaid-_r_24i_ .noteText>tspan{fill:rgb(13, 13, 13);stroke:none;font-weight:normal;}#chatgpt-mermaid-_r_24i_ .activation0{fill:rgb(243, 243, 243);stroke:hsl(0, 0%, 85.2941176471%);}#chatgpt-mermaid-_r_24i_ .activation1{fill:rgb(243, 243, 243);stroke:hsl(0, 0%, 85.2941176471%);}#chatgpt-mermaid-_r_24i_ .activation2{fill:rgb(243, 243, 243);stroke:hsl(0, 0%, 85.2941176471%);}#chatgpt-mermaid-_r_24i_ .actorPopupMenu{position:absolute;}#chatgpt-mermaid-_r_24i_ .actorPopupMenuPanel{position:absolute;fill:rgb(222, 234, 251);box-shadow:0px 8px 16px 0px rgba(0,0,0,0.2);filter:drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));}#chatgpt-mermaid-_r_24i_ .actor-man circle,#chatgpt-mermaid-_r_24i_ line{fill:rgb(222, 234, 251);stroke-width:2px;}#chatgpt-mermaid-_r_24i_ g rect.rect{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));stroke:rgb(83, 154, 248);}#chatgpt-mermaid-_r_24i_ .node .neo-node{stroke:rgb(83, 154, 248);}#chatgpt-mermaid-_r_24i_ [data-look="neo"].node rect,#chatgpt-mermaid-_r_24i_ [data-look="neo"].cluster rect,#chatgpt-mermaid-_r_24i_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-_r_24i_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_24i_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-_r_24i_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-_r_24i_-gradient);stroke-width:1px;}#chatgpt-mermaid-_r_24i_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_24i_ [data-look="neo"].node .neo-line path{stroke:rgb(83, 154, 248);filter:none;}#chatgpt-mermaid-_r_24i_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-_r_24i_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_24i_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-_r_24i_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-_r_24i_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_24i_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-_r_24i_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_24i_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}Informa e-mail e senhaSolicita autenticaçãoRetorna ID TokenEnvia token BearerVerifica tokenIdentidade validadaVerifica permissõesConsulta dados autorizadosRetorna dadosResposta JSON





Regras obrigatórias:
- Validar tokens no servidor usando Firebase Admin SDK.
- Nunca confiar em userId enviado pelo aplicativo sem verificar a identidade.
- Verificar participação familiar em toda operação compartilhada.
- Validar permissões antes de alterações e exclusões.
- Utilizar HTTPS.
- Proteger endpoints contra excesso de requisições.
- Guardar credenciais em variáveis de ambiente.
- Não incluir chaves administrativas no aplicativo.
6. Arquitetura financeira
Esta será uma das partes mais importantes do FinancePro.

Não podemos depender apenas de um campo de saldo atualizado manualmente. Precisamos garantir que as movimentações e os saldos permaneçam consistentes.
6.1. Tipos de movimentação
Tipo	Efeito
Receita paga	Aumenta o saldo
Despesa paga	Diminui o saldo
Despesa pendente	Não altera saldo disponível
Transferência	Debita uma conta e credita outra
Ajuste autorizado	Corrige o saldo com registro de auditoria

6.2. Integridade financeira
O backend será responsável por:
1. Validar o valor recebido.
2. Verificar a conta envolvida.
3. Verificar a autorização.
4. Registrar a movimentação.
5. Atualizar os saldos afetados.
6. Confirmar tudo atomicamente.
Se alguma operação falhar, toda a transação deverá ser revertida.

Utilizaremos transações do MongoDB Atlas, que exige um ambiente compatível com replica sets.
6.3. Isolamento financeiro
Teremos dois contextos:
Individual

Informações privadas de cada usuário.
- Contas pessoais
- Movimentações pessoais
- Histórico particular


Familiar

Informações compartilhadas com o grupo.
- Contas familiares
- Despesas do grupo
- Receitas compartilhadas



O usuário poderá ter contas individuais e contas familiares.

Não haverá compartilhamento automático das contas pessoais apenas porque alguém pertence a uma família.
7. Modelo de autorização familiar
Teremos dois papéis:

Administrador
- Gerencia o grupo.
- Convida participantes.
- Remove participantes.
- Visualiza as finanças.
- Pode editar movimentações de terceiros.
- Pode gerenciar contas familiares.
Membro
- Visualiza todas as finanças compartilhadas.
- Registra receitas e despesas.
- Edita seus próprios lançamentos.
- Não altera os lançamentos de outros participantes.
- Não administra participantes.
Toda alteração relevante deverá registrar quem executou a operação.
8. Estratégia de sincronização
O FinancePro será conectado à API para consultar os dados financeiros.
- TanStack Query administrará o cache.
- As alterações financeiras serão confirmadas pelo servidor.
- O aplicativo atualizará os indicadores após respostas válidas.
- Erros de conexão serão apresentados claramente.
- O cache será sincronizado quando houver conexão novamente.
Na primeira versão, não faremos gravação financeira offline com sincronização automática. Isso evita conflitos entre lançamentos simultâneos.
9. Infraestrutura e implantação
Serviço	Finalidade
GitHub	Repositório
Expo	Desenvolvimento mobile
Firebase	Autenticação e notificações
MongoDB Atlas	Banco de dados
Backend Node.js	Hospedagem da API
EAS Build	Builds Android e iOS

Vamos manter ambientes separados:
- Desenvolvimento.
- Testes.
- Produção.
Cada ambiente terá suas próprias credenciais, banco e configurações.
10. Estratégia de testes
Antes de publicar, testaremos:
- Autenticação.
- Controle de permissões.
- Isolamento entre famílias.
- Criação e edição de movimentações.
- Cálculo de saldos.
- Transferências.
- Operações simultâneas.
- Falhas de conexão.
- Layout em diferentes tamanhos de tela.
- Compatibilidade Android e iOS.

11. Decisões arquiteturais consolidadas
Mobile
Definido

React Native + Expo + TypeScript
Backend
Definido

NestJS + Node.js
Banco
Definido

MongoDB Atlas + Mongoose
Autenticação
Definido

Firebase Authentication
Arquitetura
Definido

Monólito modular
Gestão familiar
Definido

Administrador e membro
12. Próxima etapa: DATABASE.md
Agora precisamos especificar detalhadamente:
1. Collections do MongoDB.
2. Relacionamentos entre documentos.
3. Índices e consultas.
4. Schemas e validações.
5. Estrutura das contas individuais e familiares.
6. Controle de saldos e movimentações.
7. Auditoria financeira.
8. Estratégia de integridade e segurança.
Minha recomendação: concluir o DATABASE.md antes de criar os primeiros arquivos de código. Assim evitamos retrabalho na estrutura do banco.
Progresso documental
IDEA.md
Concluído

SPEC.md
Concluído

REQUIREMENTS.md
Concluído

ARCHITECTURE.md
Concluído

DATABASE.md
Próxima etapa

Documentação especificada nesta conversa; ainda não representa arquivos criados no GitHub.

Vamos manter também uma revisão semanal do código, da arquitetura e das entregas do projeto.