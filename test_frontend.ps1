#!/usr/bin/env pwsh
# Teste visual do frontend FinancePro usando Playwright
const { chromium } = require('playwright');

(async () => {
  console.log('Iniciando testes visuais do FinancePro...');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Aguardar o carregamento inicial
  await page.goto('http://localhost:8081');
  await page.waitForLoadState('networkidle');

  console.log('=== Tela de Transações ===');

  // Teste 1: Verificar se a aba de transações carrega
  console.log('1. Verificando se a lista de transações carrega...');

  // Verificar título da página
  const title = await page.title();
  console.log('   Título da página:', title);

  // Procurar por elementos da tela de transações
  const transactionList = await page.$$('[data-testid="transaction-item"]');
  console.log('   Itens de transação encontrados:', transactionList.length);

  // Verificar se há carregando/empty state
  const loading = await page.$('[data-testid="loading-indicator"]');
  console.log('   Indicador de carregando:', loading ? 'presente' : 'ausente');

  // Teste 2: Testar filtros
  console.log('\n2. Testando filtros (todas, receitas, despesas, transferências)...');

  const filterButtons = await page.$$('[data-testid="filter-chip"]');
  console.log('   Botões de filtro encontrados:', filterButtons.length);

  // Clicar em cada filtro e verificar se o conteúdo muda
  for (const btn of filterButtons) {
    const label = await page.evaluate((el) => el.textContent, btn);
    await btn.click();
    await page.waitForTimeout(500);
    const visibleItems = await page.$$('[data-testid="transaction-item"]:visible');
    console.log(`   Filtro "${label}": ${visibleItems.length} transações visíveis`);
  }

  // Resetar para todas
  await page.click('[data-testid="filter-chip"][value=""]');
  await page.waitForTimeout(500);

  // Teste 3: Botão de criar transação (FAB)
  console.log('\n3. Testando botão de criar transação...');
  const fabButton = await page.$('[data-testid="fab-button"]');
  if (fabButton) {
    console.log('   FAB encontrado, tentando clicar...');
    await fabButton.click();
    await page.waitForTimeout(500);
    const modal = await page.$('[data-testid="transaction-modal"]');
    console.log('   Modal de transação aberto:', modal ? 'SIM' : 'NÃO');
  } else {
    // Procurar por outras identificações do FAB
    const addButtons = await page.$$('button ion-icon[name="add"]');
    console.log('   Botões "add" encontrados:', addButtons.length);
    if (addButtons.length > 0) {
      await addButtons[0].click();
      await page.waitForTimeout(500);
      const modal = await page.$('[data-testid="transaction-modal"]');
      console.log('   Modal aberto após clique:', modal ? 'SIM' : 'NÃO');
    }
  }

  // Teste 4: Modal de Nova Transação - alternar tipo
  console.log('\n4. Testando modal de nova transação...');
  const typeToggleButtons = await page.$$('[data-testid="type-btn"]');
  console.log('   Botões de tipo encontrados:', typeToggleButtons.length);
  for (const btn of typeToggleButtons) {
    const text = await page.evaluate((el) => el.textContent, btn);
    console.log(`   Botão: "${text}"`);
  }

  // Teste 5: Preencher campos do modal
  console.log('\n5. Preenchendo campos do modal...');
  const descriptionInput = await page.$('[data-testid="description-input"]');
  const amountInput = await page.$('[data-testid="amount-input"]');
  const submitBtn = await page.$('[data-testid="submit-btn"]');

  if (descriptionInput && amountInput && submitBtn) {
    await descriptionInput.fill('Teste de automação');
    await amountInput.fill('150.50');
    console.log('   Descrição preenchida: "Teste de automação"');
    console.log('   Valor preenchido: "150.50"');
    await submitBtn.click();
    await page.waitForTimeout(1000);
    console.log('   Submeteu o formulário');
  } else {
    // Procurar inputs pelo tipo/placeholder
    const inputs = await page.$$('input');
    console.log('   Inputs encontrados:', inputs.length);
    for (const inp of inputs) {
      const ph = await page.evaluate((el) => el.placeholder, inp);
      console.log(`   Input placeholder: "${ph}"`);
    }
  }

  // Teste 6: Verificar se transação aparece na lista
  console.log('\n6. Verificando se transação aparece na lista...');
  await page.waitForTimeout(1000);
  const newTransactionItems = await page.$$('[data-testid="transaction-item"]');
  console.log('   Itens na lista após criação:', newTransactionItems.length);

  // Teste 7: Transferência
  console.log('\n7. Testando tela de transferência...');
  // Navegar para tela de transferência
  await page.click('[data-testid="fab-transfer"]');
  await page.waitForTimeout(500);

  const transferScreen = await page.$('[data-testid="transfer-screen"]');
  console.log('   Tela de transferência aberta:', transferScreen ? 'SIM' : 'NÃO');

  // Selecionar contas
  const accountOptions = await page.$$('[data-testid="account-option"]');
  console.log('   Opções de conta encontradas:', accountOptions.length);

  if (accountOptions.length >= 2) {
    // Clicar na conta de origem para selecionar a de destino
    await accountOptions[0].click();
    await page.waitForTimeout(300);
    // Selecionar segunda conta como destino
    if (accountOptions.length > 1) {
      await accountOptions[1].click();
      await page.waitForTimeout(300);
    }
  }

  // Informar valor
  const transferAmountInput = await page.$('[data-testid="transfer-amount"]');
  if (transferAmountInput) {
    await transferAmountInput.fill('200.00');
    console.log('   Valor da transferência preenchido: "200.00"');
  }

  // Executar transferência
  const transferBtn = await page.$('[data-testid="transfer-btn"]');
  if (transferBtn) {
    await transferBtn.click();
    await page.waitForTimeout(1000);
    console.log('   Transferência executada');
  }

  // Verificar se as transações aparecem
  await page.waitForTimeout(1000);
  const transferItems = await page.$$('[data-testid="transaction-item"]');
  console.log('   Itens na lista após transferência:', transferItems.length);

  // Teste 8: Testes de erro
  console.log('\n8. Testando validações de erro...');

  // Fechar modal atual se aberto
  const closeModals = await page.$$('[data-testid="close-modal"]');
  if (closeModals.length > 0) {
    await closeModals[0].click();
    await page.waitForTimeout(300);
  }

  // Tentar criar transação sem descrição
  await page.click('[data-testid="fab-button"]');
  await page.waitForTimeout(500);

  const submitWithoutDesc = await page.$('[data-testid="submit-btn"]');
  if (submitWithoutDesc) {
    await submitWithoutDesc.click();
    await page.waitForTimeout(300);
    const alert = await page.$('[role="alert"]');
    const alertText = alert ? await page.evaluate((el) => el.textContent, alert) : 'nenhum alerta';
    console.log('   Sem descrição - Alerta:', alertText);
  }

  // Limpar e tentar com valor zero
  // (já que o campo pode ter sido limpo pelo alerta anterior)

  // Tentar criar sem selecionar conta
  // ... (já que estamos em ambiente headless, as validações podem variar)

  console.log('\n=== Testes concluídos ===');

  await browser.close();
})().catch(err => {
  console.error('Erro durante os testes:', err);
  process.exit(1);
});