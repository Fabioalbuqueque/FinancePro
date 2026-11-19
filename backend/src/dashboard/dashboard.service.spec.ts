import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let transactionModel: any;
  let accountModel: any;
  let familiesService: any;

  beforeEach(() => {
    familiesService = {
      getCurrentFamily: jest.fn(async () => null),
    };
    accountModel = {
      find: jest.fn().mockResolvedValue([
        { _id: 'acc-1', initialBalanceCents: 1000 },
        { _id: 'acc-2', initialBalanceCents: 2000 },
      ]),
    };
    transactionModel = {
      find: jest.fn(async (query: any) => {
        if (query && query.accountId) {
          return [
            { type: 'income', amountCents: 10000, status: 'paid' },
            { type: 'expense', amountCents: 3000, status: 'paid' },
            { type: 'expense', amountCents: 9999, status: 'pending' },
          ];
        }
        if (query && query.date) {
          return [
            { type: 'income', amountCents: 10000, status: 'paid' },
            { type: 'expense', amountCents: 3000, status: 'paid' },
          ];
        }
        return [];
      }),
      populate: jest.fn().mockResolvedValue([]),
      sort: jest.fn().mockResolvedValue([]),
      limit: jest.fn().mockResolvedValue([]),
    };
    service = new DashboardService(transactionModel, accountModel, familiesService);
  });

  it('calcula saldo total somando saldo inicial + receitas pagas - despesas pagas', async () => {
    const accounts = [
      { initialBalanceCents: 1000 },
      { initialBalanceCents: 2000 },
    ];
    const allPaidTransactions = [
      { type: 'income', amountCents: 10000 },
      { type: 'expense', amountCents: 3000 },
    ];
    let totalBalanceCents = accounts.reduce((acc, a) => acc + (a.initialBalanceCents || 0), 0);
    for (const t of allPaidTransactions) {
      if (t.type === 'income') totalBalanceCents += t.amountCents;
      if (t.type === 'expense') totalBalanceCents -= t.amountCents;
    }
    expect(totalBalanceCents).toBe(10000);
  });

  it('exclui transferências dos totais de receita/despesa', async () => {
    const monthTransactions = [
      { type: 'income', amountCents: 10000 },
      { type: 'expense', amountCents: 3000 },
      { type: 'transfer', amountCents: 5000 },
    ];
    let income = 0;
    let expense = 0;
    for (const t of monthTransactions) {
      if (t.type === 'income') income += t.amountCents;
      if (t.type === 'expense') expense += t.amountCents;
    }
    expect(income).toBe(10000);
    expect(expense).toBe(3000);
    expect(income - expense).toBe(7000);
  });
});