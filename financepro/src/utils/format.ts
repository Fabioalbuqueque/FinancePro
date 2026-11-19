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
 * Exemplo: "150,50" -> 15050
 */
export function parseBrlToCents(val: string): number {
  if (!val) return 0;
  const cleanStr = val.replace(/[^\d]/g, '');
  return parseInt(cleanStr, 10) || 0;
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
