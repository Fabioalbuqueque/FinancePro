import { chromium } from 'playwright';
import fs from 'fs';

const BASE_URL = 'http://localhost:8081';
const SCREENSHOTS_DIR = '/c/Users/Fabio/Desktop/FinancePro/screenshots';

function log(msg) {
  console.log(`[${new Date().toISOString().substr(11, 8)}] ${msg}`);
}

async function saveScreenshot(page, name) {
  try {
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/${name}.png`, fullPage: false });
    log(`   Screenshot salvo: ${name}.png`);
  } catch (e) {
    log(`   ERRO ao salvar screenshot ${name}: ${e}`);
  }
}

async function findAndClick(page, selectors, description) {
  for (const sel of selectors) {
    try {
      const el = await page.locator(sel).first();
      if (await el.isVisible({ timeout: 1000 })) {
        await el.click();
        log(`   Clicou em: ${description} (${sel})`);
        return true;
      }
    } catch (e) {
      // continue
    }
  }
  log(`   NÃO ENCONTRADO: ${description}`);
  return false;
}

async function main() {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 414, height: 896 } });
  const page = await context.newPage();

  log('=== NAVEGANDO PARA O FRONTEND ===');
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 }).catch(e => log(`goto: ${e}`));
  await page.waitForTimeout(3000);
  await saveScreenshot(page, '01-home');

  log('Título atual:', await page.title());
  log('URL atual:', page.url());

  // Detectar se está em login
  const bodyText = await page.evaluate(() => document.body.innerText).catch(() => '');
  log('Texto visível (primeiras 500 chars):', bodyText.substr(0, 500).replace(/\n/g, ' | '));

  // Detectar tela atual
  const isLoginPage = bodyText.toLowerCase().includes('login') || bodyText.toLowerCase().includes('entrar') || bodyText.toLowerCase().includes('senha');
  log(`Em tela de login? ${isLoginPage}`);

  // Verificar estrutura dos botões/abas
  const allButtonTexts = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, [role="button"], [class*="tab"], [class*="Tab"]'));
    return btns.map(b => b.innerText).filter(t => t && t.length < 30);
  });
  log('Botões/abas encontrados:', allButtonTexts.join(', ') || '(nenhum)');

  // Navegar para transações se não estivermos lá
  const hasTransactionHeader = await page.locator('text=/Transações/i').first().isVisible().catch(() => false);
  if (!hasTransactionHeader) {
    log('Tela de transações não detectada. Tentando navegar...');
    await findAndClick(page, [
      '[data-tab-key="transactions"]',
      '[data-tab-key="Transactions"]',
      'text=/^Transações$/i',
      '[aria-label="Transações"]',
      'button:has-text("Transações")',
      '[class*="tab"]:has-text("Transações")',
    ], 'Aba de Transações');
    await page.waitForTimeout(2000);
    await saveScreenshot(page, '02-transacoes');
  } else {
    log('Tela de transações já visível.');
  }

  // Verificar lista de transações / carregamento
  const loadingIndicator = await page.locator('[class*="spinner"], [class*="loading"], .lottie, [class*="ActivityIndicator"]').first().isVisible().catch(() => false);
  log(`Indicador de loading visível? ${loadingIndicator}`);
  const emptyState = await page.locator('text=/Nenhum lançamento/i').first().isVisible().catch(() => false);
  log(`Empty state "Nenhum lançamento"? ${emptyState}`);

  await saveScreenshot(page, '03-transacoes-content');

  log('=== FIM DA EXPLORAÇÃO INICIAL ===');
  await browser.close();
}

main().catch(e => {
  console.error('ERRO FATAL:', e);
  process.exit(1);
});
