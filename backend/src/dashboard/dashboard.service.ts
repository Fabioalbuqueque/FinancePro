import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Transaction, TransactionDocument } from '../transactions/schemas/transaction.schema';
import { Account, AccountDocument } from '../accounts/schemas/account.schema';
import { FamiliesService } from '../families/families.service';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Transaction.name) private readonly transactionModel: Model<TransactionDocument>,
    @InjectModel(Account.name) private readonly accountModel: Model<AccountDocument>,
    private readonly familiesService: FamiliesService,
  ) {}

  async getDashboardSummary(userId: Types.ObjectId, scope: 'user' | 'family' | 'all' = 'all') {
    const currentFamily = await this.familiesService.getCurrentFamily(userId);
    const familyId = currentFamily ? (currentFamily.family as any)._id : null;

    // 1. Identificar proprietários envolvidos
    const ownerConditions: any[] = [];
    if (scope === 'user' || scope === 'all') {
      ownerConditions.push({ ownerType: 'user', ownerId: userId });
    }
    if ((scope === 'family' || scope === 'all') && familyId) {
      ownerConditions.push({ ownerType: 'family', ownerId: familyId });
    }

    const ownerFilter = ownerConditions.length > 1 ? { $or: ownerConditions } : ownerConditions[0] || { ownerId: userId };

    // 2. Buscar contas e calcular saldos
    const accounts = await this.accountModel.find({ ...ownerFilter, status: 'active' });
    const accountIds = accounts.map((a) => a._id);

    // Saldo inicial acumulado
    let totalBalanceCents = accounts.reduce((acc, a) => acc + (a.initialBalanceCents || 0), 0);

    // Efeito de transações confirmadas (paid) em todas as contas
    const allPaidTransactions = await this.transactionModel.find({
      accountId: { $in: accountIds },
      status: 'paid',
    });

    for (const t of allPaidTransactions) {
      if (t.type === 'income') {
        totalBalanceCents += t.amountCents;
      } else if (t.type === 'expense') {
        totalBalanceCents -= t.amountCents;
      }
      // Transferências entre as contas do usuário/família se anulam no total,
      // mas se vier de fora ou for entre contas, a lógica detalhada por conta é precisa.
    }

    // 3. Receitas e Despesas do Mês Atual
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const monthTransactions = await this.transactionModel.find({
      ...ownerFilter,
      status: 'paid',
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    let monthIncomeCents = 0;
    let monthExpenseCents = 0;

    for (const t of monthTransactions) {
      if (t.type === 'income') monthIncomeCents += t.amountCents;
      if (t.type === 'expense') monthExpenseCents += t.amountCents;
    }

    // 4. Últimas 5 movimentações
    const recentTransactions = await this.transactionModel
      .find(ownerFilter)
      .populate('accountId', 'name')
      .populate('categoryId', 'name icon')
      .sort({ date: -1, createdAt: -1 })
      .limit(5);

    return {
      period: {
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      },
      indicators: {
        totalBalanceCents,
        incomeCents: monthIncomeCents,
        expenseCents: monthExpenseCents,
        netResultCents: monthIncomeCents - monthExpenseCents,
      },
      accountsCount: accounts.length,
      recentTransactions,
    };
  }
}
