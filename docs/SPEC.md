2. SPEC.md — Especificação do sistema
Etapa 2 — Definida
2.1. Módulos funcionais
Código	Módulo	Prioridade
AUTH	Login e cadastro	Essencial
DASH	Dashboard	Essencial
TRANS	Receitas e despesas	Essencial
CAT	Categorias	Essencial
ACC	Contas financeiras	Alta
FAMILY	Gestão familiar	Alta
REPORT	Relatórios	Alta
BUDGET	Orçamento mensal	Alta
GOALS	Metas financeiras	Evolução

2.2. Fluxo de utilização
#chatgpt-mermaid-_r_1ec_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(13, 13, 13);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-_r_1ec_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-_r_1ec_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-_r_1ec_ .error-icon{fill:rgb(243, 243, 243);}#chatgpt-mermaid-_r_1ec_ .error-text{fill:rgb(13, 13, 13);stroke:rgb(13, 13, 13);}#chatgpt-mermaid-_r_1ec_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-_r_1ec_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-_r_1ec_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-_r_1ec_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-_r_1ec_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-_r_1ec_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-_r_1ec_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-_r_1ec_ .marker.cross{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-_r_1ec_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-_r_1ec_ p{margin:0;}#chatgpt-mermaid-_r_1ec_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";color:rgb(13, 13, 13);}#chatgpt-mermaid-_r_1ec_ .cluster-label text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-_r_1ec_ .cluster-label span{color:rgb(13, 13, 13);}#chatgpt-mermaid-_r_1ec_ .cluster-label span p{background-color:transparent;}#chatgpt-mermaid-_r_1ec_ .label text,#chatgpt-mermaid-_r_1ec_ span{fill:rgb(13, 13, 13);color:rgb(13, 13, 13);}#chatgpt-mermaid-_r_1ec_ .node rect,#chatgpt-mermaid-_r_1ec_ .node circle,#chatgpt-mermaid-_r_1ec_ .node ellipse,#chatgpt-mermaid-_r_1ec_ .node polygon,#chatgpt-mermaid-_r_1ec_ .node path{fill:rgb(222, 234, 251);stroke:rgb(83, 154, 248);stroke-width:1px;}#chatgpt-mermaid-_r_1ec_ .rough-node .label text,#chatgpt-mermaid-_r_1ec_ .node .label text,#chatgpt-mermaid-_r_1ec_ .image-shape .label,#chatgpt-mermaid-_r_1ec_ .icon-shape .label{text-anchor:middle;}#chatgpt-mermaid-_r_1ec_ .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#chatgpt-mermaid-_r_1ec_ .rough-node .label,#chatgpt-mermaid-_r_1ec_ .node .label,#chatgpt-mermaid-_r_1ec_ .image-shape .label,#chatgpt-mermaid-_r_1ec_ .icon-shape .label{text-align:center;}#chatgpt-mermaid-_r_1ec_ .node.clickable{cursor:pointer;}#chatgpt-mermaid-_r_1ec_ .root .anchor path{fill:rgb(143, 143, 143)!important;stroke-width:0;stroke:rgb(143, 143, 143);}#chatgpt-mermaid-_r_1ec_ .arrowheadPath{fill:rgb(143, 143, 143);}#chatgpt-mermaid-_r_1ec_ .edgePath .path{stroke:rgb(143, 143, 143);stroke-width:1px;}#chatgpt-mermaid-_r_1ec_ .flowchart-link{stroke:rgb(143, 143, 143);fill:none;}#chatgpt-mermaid-_r_1ec_ .edgeLabel{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-_r_1ec_ .edgeLabel p{background-color:rgb(252, 252, 252);}#chatgpt-mermaid-_r_1ec_ .edgeLabel rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-_r_1ec_ .labelBkg{background-color:rgba(252, 252, 252, 0.5);}#chatgpt-mermaid-_r_1ec_ .cluster rect{fill:rgb(243, 243, 243);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-_r_1ec_ .cluster text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-_r_1ec_ .cluster span{color:rgb(13, 13, 13);}#chatgpt-mermaid-_r_1ec_ div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:12px;background:rgb(243, 243, 243);border:1px solid rgba(0, 0, 0, 0.1);border-radius:2px;pointer-events:none;z-index:100;}#chatgpt-mermaid-_r_1ec_ .flowchartTitleText{text-anchor:middle;font-size:18px;fill:rgb(13, 13, 13);}#chatgpt-mermaid-_r_1ec_ rect.text{fill:none;stroke-width:0;}#chatgpt-mermaid-_r_1ec_ .icon-shape,#chatgpt-mermaid-_r_1ec_ .image-shape{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-_r_1ec_ .icon-shape p,#chatgpt-mermaid-_r_1ec_ .image-shape p{background-color:rgb(252, 252, 252);padding:2px;}#chatgpt-mermaid-_r_1ec_ .icon-shape .label rect,#chatgpt-mermaid-_r_1ec_ .image-shape .label rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-_r_1ec_ .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#chatgpt-mermaid-_r_1ec_ .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#chatgpt-mermaid-_r_1ec_ .node .neo-node{stroke:rgb(83, 154, 248);}#chatgpt-mermaid-_r_1ec_ [data-look="neo"].node rect,#chatgpt-mermaid-_r_1ec_ [data-look="neo"].cluster rect,#chatgpt-mermaid-_r_1ec_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-_r_1ec_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_1ec_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-_r_1ec_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-_r_1ec_-gradient);stroke-width:1px;}#chatgpt-mermaid-_r_1ec_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_1ec_ [data-look="neo"].node .neo-line path{stroke:rgb(83, 154, 248);filter:none;}#chatgpt-mermaid-_r_1ec_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-_r_1ec_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_1ec_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-_r_1ec_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-_r_1ec_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_1ec_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-_r_1ec_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_1ec_ .node text{font-size:14px;font-weight:600;letter-spacing:normal;fill:rgb(0, 79, 153);}#chatgpt-mermaid-_r_1ec_ .edgeLabels text{font-size:13px;font-weight:600;letter-spacing:-0.08px;fill:rgb(0, 79, 153);}#chatgpt-mermaid-_r_1ec_ .node tspan[font-weight="normal"],#chatgpt-mermaid-_r_1ec_ .edgeLabels tspan[font-weight="normal"]{font-weight:600;}#chatgpt-mermaid-_r_1ec_ .edgeLabel .label rect{opacity:1;rx:13px;ry:13px;fill:rgb(245, 250, 255);stroke:rgb(206, 219, 229);stroke-width:1px;}#chatgpt-mermaid-_r_1ec_ .node rect,#chatgpt-mermaid-_r_1ec_ .node circle,#chatgpt-mermaid-_r_1ec_ .node ellipse,#chatgpt-mermaid-_r_1ec_ .node polygon,#chatgpt-mermaid-_r_1ec_ .node path{fill:rgb(229, 243, 255);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-_r_1ec_ .node rect{rx:16px;ry:16px;}#chatgpt-mermaid-_r_1ec_ .mermaid-decision .label-container{fill:rgb(245, 250, 255);stroke:rgb(206, 219, 229);stroke-dasharray:2,2;}#chatgpt-mermaid-_r_1ec_ .edgePaths .flowchart-link{stroke:rgb(143, 143, 143);stroke-width:1px;stroke-linecap:round;stroke-linejoin:round;}#chatgpt-mermaid-_r_1ec_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-_r_1ec_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}Iniciar aplicativoUsuário autenticado?Login ou cadastroAutenticação FirebaseValidar sessão na APIDashboardReceitas e despesasÁrea familiarRelatóriosContas e cartõesMetas financeirasNãoSim





2.3. Regras de negócio
Usuários e autenticação
- Cadastro por nome, e-mail e senha.
- Login e recuperação de senha.
- Autenticação através do Firebase Authentication.
- Cada conta possui um identificador único.
- A API verifica a identidade do usuário antes de autorizar operações.
Controle financeiro
- Receita aumenta o saldo.
- Despesa diminui o saldo.
- Transferência movimenta valores entre contas, sem ser contabilizada como receita ou despesa.
- Movimentações possuem categoria, descrição, valor e data.
- Valores serão armazenados em centavos inteiros.
- Exclusões e alterações deverão preservar a integridade dos saldos e relatórios.
Gestão familiar
- Um usuário poderá criar um grupo familiar.
- Poderá convidar outros participantes.
- Cada participante terá permissões específicas.
- Despesas poderão ser individuais ou compartilhadas.
- Os dados pessoais não compartilhados continuarão privados.
2.4. Requisitos não funcionais
Requisito	Definição
Segurança	Controle de acesso por usuário
Desempenho	Consultas paginadas e indexadas
Escalabilidade	Backend modular
Compatibilidade	Android e iOS
Usabilidade	Interface adaptável
Disponibilidade	Sincronização com servidor
Manutenção	Código tipado e testável


3. Escopo da versão 1.0
A primeira versão será funcional, sem tentar implementar todos os recursos de uma vez.
MVP — primeira entrega
Funcionalidades incluídas
Autenticação
- [x] Login e cadastro planejados
- [x] Recuperação de senha planejada
- [x] Sessão autenticada pelo Firebase

Dashboard
- [x] Saldo total
- [x] Receitas do mês
- [x] Despesas do mês
- [x] Gráfico de movimentações
- [x] Últimas transações

Movimentações
- [x] Cadastrar receita
- [x] Cadastrar despesa
- [x] Editar movimentação
- [x] Excluir movimentação
- [x] Categorias

Gestão familiar
- [x] Criar grupo familiar
- [x] Convidar participantes
- [x] Definir permissões
- [x] Consultar despesas compartilhadas

Experiência
- [x] Modo claro
- [x] Modo escuro
- [x] Layout Android e iOS
- [x] Navegação inferior

Os itens acima representam o escopo planejado, não funcionalidades já implementadas.


4. Telas da versão 1.0










01. Login

Acesso e cadastro.











02. Dashboard

Resumo financeiro.











03. Transações

Histórico e movimentações.











04. Família

Gestão compartilhada.


5. Arquitetura técnica inicial
Vamos manter Firebase e MongoDB com responsabilidades separadas.
Tecnologia	Responsabilidade
React Native	Aplicativo mobile
Expo	Desenvolvimento e builds
TypeScript	Tipagem
Firebase Auth	Identidade e autenticação
Firebase Cloud Messaging	Notificações
Node.js	Backend
NestJS	Organização da API
MongoDB Atlas	Persistência financeira
Mongoose	Modelagem dos documentos

Fluxo de segurança
1. Usuário realiza login pelo Firebase.
2. Firebase fornece um token de identidade.
3. Aplicativo envia o token para a API.
4. Backend valida o token.
5. Backend identifica o usuário.
6. MongoDB retorna somente os dados autorizados.
Regra fundamental: o aplicativo nunca acessará diretamente o MongoDB. Toda operação passará pela API.
Estrutura de dados prevista
MongoDB
│
├── users
│   ├── name
│   ├── email
│   └── firebaseUid
│
├── families
│   ├── name
│   └── ownerId
│
├── familyMembers
│   ├── familyId
│   ├── userId
│   └── role
│
├── accounts
│   ├── userId
│   ├── name
│   └── balance
│
├── transactions
│   ├── userId
│   ├── familyId
│   ├── accountId
│   ├── type
│   ├── amount
│   ├── categoryId
│   └── date
│
└── categories
    ├── name
    └── type


Também teremos índices, validações, isolamento entre famílias e controle de permissões no backend.

6. Plano de desenvolvimento
A ordem de implementação será:
1. Documentação complementar
   
   REQUIREMENTS, ARCHITECTURE, DATABASE e DESIGN.
2. Preparação do ambiente
   
   Node.js, Expo, React Native, Firebase e MongoDB.
3. Autenticação
   
   Login, cadastro, recuperação de senha e proteção de rotas.
4. Dashboard
   
   Indicadores financeiros e gráficos.
5. Movimentações
   
   Receitas, despesas, categorias e histórico.
6. Área familiar
   
   Grupos, convites e permissões.
7. Testes e publicação
   
   Testes funcionais, segurança, builds Android e iOS.
7. Decisões técnicas que vamos manter
- Monorepo: aplicativo e backend organizados no mesmo repositório.
- TypeScript: tanto no mobile quanto no backend.
- NestJS: backend modular e escalável.
- MongoDB Atlas: banco principal.
- Firebase Authentication: autenticação centralizada.
- Expo: builds e desenvolvimento mobile.
- GitHub: histórico de alterações e versionamento.
- Testes: unitários, integração e ponta a ponta.