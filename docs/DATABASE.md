DATABASE.md
Etapa 5
MongoDB Atlas
v1.0.0

1. Objetivo
O banco de dados deverá armazenar:
- Usuários.
- Famílias.
- Participantes.
- Convites.
- Contas financeiras.
- Categorias.
- Receitas.
- Despesas.
- Transferências.
- Histórico de alterações.
A estrutura deverá permitir que cada usuário tenha suas próprias finanças e participe de um grupo familiar compartilhado.
2. Estrutura das collections
MongoDB Atlas

Banco principal do FinancePro

- users — usuários
- families — grupos familiares
- familyMembers — participantes e permissões
- invitations — convites
- accounts — contas financeiras
- categories — categorias
- transactions — movimentações
- auditLogs — auditoria

3. Relacionamentos
#chatgpt-mermaid-_r_2u9_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(13, 13, 13);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-_r_2u9_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-_r_2u9_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-_r_2u9_ .error-icon{fill:rgb(243, 243, 243);}#chatgpt-mermaid-_r_2u9_ .error-text{fill:rgb(13, 13, 13);stroke:rgb(13, 13, 13);}#chatgpt-mermaid-_r_2u9_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-_r_2u9_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-_r_2u9_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-_r_2u9_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-_r_2u9_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-_r_2u9_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-_r_2u9_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-_r_2u9_ .marker.cross{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-_r_2u9_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-_r_2u9_ p{margin:0;}#chatgpt-mermaid-_r_2u9_ .entityBox{fill:rgb(222, 234, 251);stroke:rgb(83, 154, 248);}#chatgpt-mermaid-_r_2u9_ .relationshipLabelBox{fill:rgb(243, 243, 243);opacity:0.7;background-color:rgb(243, 243, 243);}#chatgpt-mermaid-_r_2u9_ .relationshipLabelBox rect{opacity:0.5;}#chatgpt-mermaid-_r_2u9_ .labelBkg{background-color:rgba(243, 243, 243, 0.5);}#chatgpt-mermaid-_r_2u9_ .edgeLabel{background-color:rgb(252, 252, 252);}#chatgpt-mermaid-_r_2u9_ .edgeLabel .label rect{fill:rgb(252, 252, 252);}#chatgpt-mermaid-_r_2u9_ .edgeLabel .label text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-_r_2u9_ .edgeLabel .label{fill:rgb(83, 154, 248);font-size:14px;}#chatgpt-mermaid-_r_2u9_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";color:rgb(13, 13, 13);}#chatgpt-mermaid-_r_2u9_ .edge-pattern-dashed{stroke-dasharray:8,8;}#chatgpt-mermaid-_r_2u9_ .node rect,#chatgpt-mermaid-_r_2u9_ .node circle,#chatgpt-mermaid-_r_2u9_ .node ellipse,#chatgpt-mermaid-_r_2u9_ .node polygon{fill:rgb(222, 234, 251);stroke:rgb(83, 154, 248);stroke-width:1px;}#chatgpt-mermaid-_r_2u9_ .relationshipLine{stroke:rgb(143, 143, 143);stroke-width:1px;fill:none;}#chatgpt-mermaid-_r_2u9_ .marker{fill:none!important;stroke:rgb(143, 143, 143)!important;stroke-width:1;}#chatgpt-mermaid-_r_2u9_ [data-look=neo].labelBkg{background-color:rgba(243, 243, 243, 0.5);}#chatgpt-mermaid-_r_2u9_ .node .neo-node{stroke:rgb(83, 154, 248);}#chatgpt-mermaid-_r_2u9_ [data-look="neo"].node rect,#chatgpt-mermaid-_r_2u9_ [data-look="neo"].cluster rect,#chatgpt-mermaid-_r_2u9_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-_r_2u9_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_2u9_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-_r_2u9_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-_r_2u9_-gradient);stroke-width:1px;}#chatgpt-mermaid-_r_2u9_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_2u9_ [data-look="neo"].node .neo-line path{stroke:rgb(83, 154, 248);filter:none;}#chatgpt-mermaid-_r_2u9_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-_r_2u9_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_2u9_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-_r_2u9_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-_r_2u9_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_2u9_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-_r_2u9_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_2u9_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}USERACCOUNTTRANSACTIONFAMILY_MEMBERFAMILYCATEGORYAUDIT_LOGownscreatesparticipatescontainsownssharesrecordsclassifiesperforms





Cada documento terá um identificador próprio.

O Firebase UID será utilizado para identificar o usuário autenticado, enquanto os documentos do MongoDB utilizarão seus próprios _id.

4. Collection: users
Armazena os dados de perfil.
interface User {
  _id: ObjectId;

  firebaseUid: string;
  name: string;
  email: string;

  preferences: {
    theme: "light" | "dark" | "system";
    currency: "BRL";
    language: "pt-BR";
  };

  status: "active" | "disabled";

  createdAt: Date;
  updatedAt: Date;
}


Índices
- firebaseUid: único.
- email: único, normalizado.
- status: consulta de usuários ativos.
Não armazenaremos senhas nesta collection.

5. Collection: families
Representa um grupo familiar.
interface Family {
  _id: ObjectId;

  name: string;
  ownerId: ObjectId;

  status: "active" | "disabled";

  createdAt: Date;
  updatedAt: Date;
}


Regras
- Cada família terá um administrador principal.
- O administrador deverá ser um usuário existente.
- Uma família poderá possuir vários participantes.
- O grupo poderá ter contas financeiras compartilhadas.
- O nome poderá ser alterado pelo administrador.

6. Collection: familyMembers
Controla os participantes e suas permissões.
interface FamilyMember {
  _id: ObjectId;

  familyId: ObjectId;
  userId: ObjectId;

  role: "admin" | "member";

  status: "active" | "pending" | "removed";

  joinedAt?: Date;
  createdAt: Date;
}


Índices
- familyId + userId: único.
- userId + status: localizar famílias do usuário.
- familyId + status: listar participantes ativos.
Regra de autorização
O backend deverá verificar:
1. Se o usuário está autenticado.
2. Se pertence à família.
3. Se o vínculo está ativo.
4. Se possui permissão para executar a operação.
Apenas o administrador poderá gerenciar os participantes.

7. Collection: accounts
Representa contas individuais ou familiares.
interface Account {
  _id: ObjectId;

  name: string;

  ownerType: "user" | "family";

  ownerId: ObjectId;

  type:
    | "cash"
    | "checking"
    | "savings"
    | "digital";

  initialBalanceCents: number;

  status: "active" | "archived";

  createdAt: Date;
  updatedAt: Date;
}


Exemplos
Conta	Proprietário
Minha carteira	Usuário
Minha poupança	Usuário
Conta da família	Família
Reserva familiar	Família

Regras
- Conta individual pertence a um usuário.
- Conta familiar pertence a uma família.
- Membros ativos podem visualizar contas familiares.
- Alterações de conta serão validadas no backend.
- Contas arquivadas não poderão receber novas movimentações.
O saldo será calculado a partir do saldo inicial e das movimentações confirmadas.

8. Collection: categories
Categorias para organizar receitas e despesas.
interface Category {
  _id: ObjectId;

  name: string;

  type: "income" | "expense";

  scope: "system" | "user" | "family";

  ownerId?: ObjectId;

  icon?: string;

  isActive: boolean;

  createdAt: Date;
}


Categorias iniciais:

Receitas: salário, freelance, investimentos, outros.

Despesas: moradia, alimentação, transporte, saúde, educação, lazer, contas e outros.

Categorias personalizadas poderão ser criadas pelo usuário ou administrador familiar, conforme o escopo.

9. Collection: transactions
Esta será a principal collection financeira.
interface Transaction {
  _id: ObjectId;

  userId: ObjectId;

  ownerType: "user" | "family";
  ownerId: ObjectId;

  accountId: ObjectId;

  categoryId?: ObjectId;

  type: "income" | "expense" | "transfer";

  amountCents: number;

  description: string;

  status: "pending" | "paid" | "cancelled";

  date: Date;

  transferId?: ObjectId;

  createdAt: Date;
  updatedAt: Date;
}


Regras financeiras
- Valores devem ser positivos.
- O tipo determina o efeito financeiro.
- Receitas pagas aumentam o saldo.
- Despesas pagas diminuem o saldo.
- Despesas pendentes não alteram o saldo disponível.
- Transferências precisam de registros vinculados.
- Movimentações canceladas não entram no saldo.
- Toda movimentação deve possuir um responsável.
Índices
Índice	Finalidade
ownerId + date	Histórico individual ou familiar
accountId + date	Movimentações da conta
userId + createdAt	Histórico do responsável
categoryId + date	Relatórios por categoria
transferId	Localizar transferências vinculadas

Os índices serão ajustados conforme os padrões reais de consulta.

10. Transferências entre contas
Transferências deverão ser tratadas como operações financeiras atômicas.

Exemplo:

O usuário transfere R$ 200,00 da conta corrente para a poupança.
Conta de origem

Conta corrente
− R$ 200,00

Conta de destino

Poupança
+ R$ 200,00



Impacto no patrimônio total: R$ 0,00

A operação deverá:
1. Validar as duas contas.
2. Verificar o acesso às contas.
3. Validar o valor.
4. Criar os registros vinculados.
5. Atualizar os saldos.
6. Confirmar a transação no MongoDB.
Se houver falha, nenhum dos lados deverá ser confirmado isoladamente.

11. Collection: auditLogs
A auditoria permitirá identificar alterações relevantes.
interface AuditLog {
  _id: ObjectId;

  actorId: ObjectId;

  familyId?: ObjectId;

  entityType:
    | "transaction"
    | "account"
    | "family"
    | "member";

  entityId: ObjectId;

  action:
    | "create"
    | "update"
    | "delete"
    | "archive";

  changes?: Record<string, unknown>;

  createdAt: Date;
}


A auditoria será utilizada para:
- Identificar quem alterou uma movimentação.
- Registrar alterações em contas.
- Registrar alterações de participantes.
- Investigar operações financeiras.
- Manter rastreabilidade.
Dados sensíveis, senhas, tokens e credenciais não serão registrados.

12. Estratégia de cálculo dos saldos
O saldo de uma conta será calculado considerando:
- Saldo inicial.
- Receitas pagas.
- Despesas pagas.
- Transferências recebidas.
- Transferências enviadas.
- Ajustes autorizados.
A regra será:
\[
\begin{aligned}
Saldo ={}& SaldoInicial\\
&+ ReceitasPagas\\
&- DespesasPagas\\
&+ TransferênciasRecebidas\\
&- TransferênciasEnviadas
\end{aligned}
\]

O dashboard deverá apresentar o saldo disponível e o resultado financeiro do período.

Importante: transferências não serão contabilizadas como receita ou despesa nos relatórios financeiros.

13. Segurança do banco
O MongoDB deverá possuir:
- Autenticação de acesso.
- Credenciais protegidas.
- Conexão segura.
- Índices apropriados.
- Validação dos documentos.
- Backups.
- Controle de acesso por ambiente.
A aplicação não terá acesso administrativo ao banco.

O backend será o único responsável por consultar e modificar documentos financeiros.

14. Conclusão do DATABASE.md
Collections
Definidas

Relacionamentos
Definidos

Movimentações
Definidas

Transferências
Definidas

Permissões familiares
Definidas

Auditoria
Definida

Especificação concluída nesta conversa. Ainda será necessário criar os schemas Mongoose e validar as operações com testes.

Próxima etapa: DESIGN.md
Agora vamos definir a identidade visual do FinancePro:
- Paleta de cores.
- Modo claro e escuro.
- Tipografia.
- Dashboard.
- Componentes reutilizáveis.
- Navegação.
- Formulários.
- Gráficos.
- Responsividade Android e iOS.
Depois disso, teremos a documentação necessária para começar a implementação da versão 1.0.