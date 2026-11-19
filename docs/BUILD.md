# Build e Distribuição

## Pré-requisitos

- EAS CLI instalado
- Conta Expo
- Projeto configurado

## Instalação do EAS CLI

```bash
npm install -g eas-cli
```

## Login

```bash
eas login
```

## Configuração

O arquivo `financepro/eas.json` define os profiles de build:

- **development**: Build de desenvolvimento com IP local
- **preview**: Build para testes internos
- **production**: Build para lojas

## Builds

### Android

```bash
cd financepro
eas build --platform android --profile development
```

### iOS

```bash
cd financepro
eas build --platform ios --profile development
```

### Ambos

```bash
cd financepro
eas build --platform all --profile development
```

## Testes E2E

### Teste 1: Cadastro e Login

1. Abra o app no dispositivo
2. Vá para "Criar conta"
3. Preencha os dados
4. Verifique se redireciona para login
5. Faça login com os dados
6. Verifique se aparece no Dashboard

### Teste 2: Criar Conta

1. Vá para a aba "Contas"
2. Clique em "Nova Conta"
3. Preencha nome, tipo e saldo inicial
4. Verifique se a conta aparece na lista
5. Verifique se o saldo está correto

### Teste 3: Criar Transação

1. Vá para a aba "Transações"
2. Clique no botão "+"
3. Selecione receita ou despesa
4. Preencha descrição, valor, conta e data
5. Verifique se a transação aparece na lista
6. Verifique se o saldo atualizou no Dashboard

### Teste 4: Transferência

1. Vá para a aba "Transações"
2. Clique no botão de transferência
3. Selecione conta de origem e destino
4. Informe o valor
5. Verifique se as duas transações foram criadas
6. Verifique se os saldos atualizaram

### Teste 5: Família

1. Vá para a aba "Família"
2. Crie um grupo familiar
3. Convide um membro (use outro usuário)
4. Verifique se o membro aparece na lista
5. Teste criar conta familiar
6. Teste criar transação na conta familiar

### Teste 6: Relatórios

1. Vá para "Perfil" → "Relatórios"
2. Navegue entre meses
3. Verifique se os totais estão corretos
4. Verifique a distribuição por categoria

### Teste 7: Metas

1. Vá para "Perfil" → "Metas"
2. Crie uma meta com valor alvo e prazo
3. Adicione contribuições
4. Verifique o progresso
5. Verifique se a meta é marcada como completada

### Teste 8: Orçamento

1. Vá para "Perfil" → "Orçamento"
2. Defina o orçamento total
3. Verifique o progresso de gastos
4. Verifique o alerta quando ultrapassar

## Variáveis de Build

### development

```json
{
  "EXPO_PUBLIC_API_BASE_URL": "http://SEU_IP:3000"
}
```

### production

```json
{
  "EXPO_PUBLIC_API_BASE_URL": "https://api.financepro.com"
}
```

## Submissão às Lojas

### Play Store

```bash
cd financepro
eas submit --platform android --profile production
```

### App Store

```bash
cd financepro
eas submit --platform ios --profile production
```

## Checklist de Release

- [ ] Todos os testes passam
- [ ] Testes manuais completos
- [ ] Build de produção gerado
- [ ] Versão atualizada no `app.json`
- [ ] Variáveis de ambiente configuradas
- [ ] Backend em produção
- [ ] Firebase em produção
- [ ] MongoDB em produção
- [ ] SSL configurado
- [ ] Backups automáticos

## Suporte

Para problemas com builds:

1. Verifique logs: `eas build --verbose`
2. Confira permissões Firebase
3. Verifique conexões com backend
4. Teste em dispositivo físico
