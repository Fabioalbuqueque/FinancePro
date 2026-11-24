/**
 * Converte valor em centavos inteiros para string formatada em Real (BRL)
 * Exemplo: 125050 -> "R$ 1.250,50"
 */
export function formatCurrency(cents: number = 0): string {
  const value = (cents || 0) / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Converte string digitada pelo usuário em centavos inteiros
 * Suporta formato brasileiro: "1.250,50" ou "150,50" ou "150"
 * Exemplos:
 *   "150,50"   -> 15050
 *   "1.250,50" -> 125050
 *   "150"      -> 15000
 *   "0,01"     -> 1
 */
export function parseBrlToCents(val: string): number {
  if (!val || !val.trim()) return 0;

  const clean = val.trim();

  // Remove prefixo "R$" e espaços
  const withoutPrefix = clean.replace(/^R\$\s*/i, '');

  // Se contém vírgula, o Brasil usa ponto como milhar e vírgula como separador decimal
  if (withoutPrefix.includes(',')) {
    // Remove pontos de milhar
    const withoutThousands = withoutPrefix.replace(/\./g, '');
    const parts = withoutThousands.split(',');
    const wholePart = parts[0] || '0';
    const decimalPart = parts[1] || '0';

    const wholeCents = parseInt(wholePart, 10) || 0;
    const decimalCents = parseInt(decimalPart.padEnd(2, '0').slice(0, 2), 10) || 0;

    return wholeCents * 100 + decimalCents;
  }

  // Sem vírgula: assume que o valor está em reais e converte para centavos
  const onlyDigits = withoutPrefix.replace(/[^\d]/g, '');
  return (parseInt(onlyDigits, 10) || 0) * 100;
}

/**
 * Formata data ISO para pt-BR
 */
export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}
