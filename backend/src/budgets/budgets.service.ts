import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Budget, BudgetDocument } from './schemas/budget.schema';
import { CreateBudgetDto, UpdateBudgetDto } from './dto/budget.dto';
import { Transaction, TransactionDocument } from '../transactions/schemas/transaction.schema';

@Injectable()
export class BudgetsService {
  constructor(
    @InjectModel(Budget.name) private readonly budgetModel: Model<BudgetDocument>,
    @InjectModel(Transaction.name) private readonly transactionModel: Model<TransactionDocument>,
  ) {}

  async createBudget(userId: Types.ObjectId, dto: CreateBudgetDto) {
    // Verificar se já existe orçamento para esse mês
    const existing = await this.budgetModel.findOne({
      userId,
      month: dto.month,
      year: dto.year,
      status: 'active',
    });

    if (existing) {
      throw new BadRequestException('Você já tem um orçamento ativo para este mês');
    }

    const budget = await this.budgetModel.create({
      userId,
      month: dto.month,
      year: dto.year,
      totalBudgetCents: dto.totalBudgetCents,
      categoryBudgets: dto.categoryBudgets?.map((cb) => ({
        categoryId: new Types.ObjectId(cb.categoryId),
        budgetCents: cb.budgetCents,
      })),
      status: 'active',
    });

    return budget;
  }

  async getCurrentBudget(userId: Types.ObjectId) {
    const now = new Date();
    const budget = await this.budgetModel.findOne({
      userId,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      status: 'active',
    });

    if (!budget) return null;

    // Calcular gastos por categoria
    const expenses = await this.transactionModel.aggregate([
      {
        $match: {
          userId,
          ownerType: 'user',
          ownerId: userId,
          type: 'expense',
          status: 'paid',
          date: {
            $gte: new Date(budget.year, budget.month - 1, 1),
            $lte: new Date(budget.year, budget.month, 0, 23, 59, 59, 999),
          },
        },
      },
      {
        $group: {
          _id: '$categoryId',
          totalSpentCents: { $sum: '$amountCents' },
          count: { $sum: 1 },
        },
      },
    ]);

    const totalSpentCents = expenses.reduce((acc, exp) => acc + exp.totalSpentCents, 0);
    const remainingCents = Math.max(0, budget.totalBudgetCents - totalSpentCents);
    const percentageUsed =
      budget.totalBudgetCents > 0
        ? Math.min(100, Math.round((totalSpentCents / budget.totalBudgetCents) * 100))
        : 0;

    return {
      ...budget.toObject(),
      totalSpentCents,
      remainingCents,
      percentageUsed,
    };
  }

  async getBudgetForPeriod(userId: Types.ObjectId, month: number, year: number) {
    const budget = await this.budgetModel.findOne({
      userId,
      month,
      year,
      status: 'active',
    });

    if (!budget) {
      throw new NotFoundException('Orçamento não encontrado para este período');
    }

    return budget;
  }

  async updateBudget(userId: Types.ObjectId, budgetId: string, dto: UpdateBudgetDto) {
    const budget = await this.budgetModel.findOne({
      _id: budgetId,
      userId,
      status: 'active',
    });

    if (!budget) {
      throw new NotFoundException('Orçamento não encontrado');
    }

    if (dto.totalBudgetCents !== undefined) {
      budget.totalBudgetCents = dto.totalBudgetCents;
    }

    if (dto.categoryBudgets) {
      budget.categoryBudgets = dto.categoryBudgets.map((cb) => ({
        categoryId: new Types.ObjectId(cb.categoryId),
        budgetCents: cb.budgetCents,
      }));
    }

    await budget.save();
    return budget;
  }

  async deleteBudget(userId: Types.ObjectId, budgetId: string) {
    const budget = await this.budgetModel.findOne({
      _id: budgetId,
      userId,
      status: 'active',
    });

    if (!budget) {
      throw new NotFoundException('Orçamento não encontrado');
    }

    budget.status = 'archived';
    await budget.save();

    return { message: 'Orçamento arquivado com sucesso' };
  }
}
