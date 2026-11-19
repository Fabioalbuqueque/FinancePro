import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Transaction, TransactionDocument } from '../transactions/schemas/transaction.schema';
import { FamiliesService } from '../families/families.service';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Transaction.name) private readonly transactionModel: Model<TransactionDocument>,
    private readonly familiesService: FamiliesService,
  ) {}

  async getMonthlyReport(
    userId: Types.ObjectId,
    month: number,
    year: number,
    scope: 'user' | 'family' | 'all' = 'all',
  ) {
    const currentFamily = await this.familiesService.getCurrentFamily(userId);
    const familyId = currentFamily ? (currentFamily.family as any)._id : null;

    const ownerConditions: any[] = [];
    if (scope === 'user' || scope === 'all') {
      ownerConditions.push({ ownerType: 'user', ownerId: userId });
    }
    if ((scope === 'family' || scope === 'all') && familyId) {
      ownerConditions.push({ ownerType: 'family', ownerId: familyId });
    }

    const ownerFilter = ownerConditions.length > 1 ? { $or: ownerConditions } : ownerConditions[0] || { ownerId: userId };

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Agrupamento de despesas por categoria
    const expensesByCategory = await this.transactionModel.aggregate([
      {
        $match: {
          ...ownerFilter,
          type: 'expense',
          status: 'paid',
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$categoryId',
          totalCents: { $sum: '$amountCents' },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      { $sort: { totalCents: -1 } },
    ]);

    // Totais do período
    const totals = await this.transactionModel.aggregate([
      {
        $match: {
          ...ownerFilter,
          status: 'paid',
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$type',
          totalCents: { $sum: '$amountCents' },
        },
      },
    ]);

    let totalIncomeCents = 0;
    let totalExpenseCents = 0;

    for (const item of totals) {
      if (item._id === 'income') totalIncomeCents = item.totalCents;
      if (item._id === 'expense') totalExpenseCents = item.totalCents;
    }

    return {
      period: { month, year },
      totalIncomeCents,
      totalExpenseCents,
      netSavingsCents: totalIncomeCents - totalExpenseCents,
      expensesByCategory: expensesByCategory.map((c) => ({
        categoryId: c._id,
        categoryName: c.category?.name || 'Sem Categoria',
        icon: c.category?.icon || 'pricetag',
        totalCents: c.totalCents,
        count: c.count,
        percentage: totalExpenseCents > 0 ? ((c.totalCents / totalExpenseCents) * 100).toFixed(1) : '0',
      })),
    };
  }
}
