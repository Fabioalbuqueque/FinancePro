import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Goal, GoalDocument } from './schemas/goal.schema';
import { CreateGoalDto, UpdateGoalDto } from './dto/goal.dto';

@Injectable()
export class GoalsService {
  constructor(
    @InjectModel(Goal.name) private readonly goalModel: Model<GoalDocument>,
  ) {}

  async createGoal(userId: Types.ObjectId, dto: CreateGoalDto) {
    if (dto.currentAmountCents && dto.currentAmountCents >= dto.targetAmountCents) {
      throw new BadRequestException(
        'Valor inicial não pode ser maior ou igual ao valor alvo',
      );
    }

    const goal = await this.goalModel.create({
      userId,
      name: dto.name,
      targetAmountCents: dto.targetAmountCents,
      currentAmountCents: dto.currentAmountCents || 0,
      deadline: new Date(dto.deadline),
      description: dto.description,
      category: dto.category,
      status: 'active',
    });

    return goal;
  }

  async listGoals(userId: Types.ObjectId) {
    const goals = await this.goalModel
      .find({ userId, status: 'active' })
      .sort({ deadline: 1 });

    return goals.map((goal) => ({
      ...goal.toObject(),
      progressPercentage: this.calculateProgress(goal),
      daysRemaining: this.calculateDaysRemaining(goal),
    }));
  }

  async getGoalById(userId: Types.ObjectId, goalId: string) {
    const goal = await this.goalModel.findOne({ _id: goalId, userId });

    if (!goal) {
      throw new NotFoundException('Meta não encontrada');
    }

    return {
      ...goal.toObject(),
      progressPercentage: this.calculateProgress(goal),
      daysRemaining: this.calculateDaysRemaining(goal),
    };
  }

  private calculateProgress(goal: GoalDocument): number {
    if (goal.targetAmountCents <= 0) return 0;
    return Math.min(
      100,
      Math.round((goal.currentAmountCents / goal.targetAmountCents) * 100),
    );
  }

  private calculateDaysRemaining(goal: GoalDocument): number {
    const now = new Date();
    const deadline = new Date(goal.deadline);
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }

  async addContribution(
    userId: Types.ObjectId,
    goalId: string,
    amountCents: number,
  ) {
    const goal = await this.goalModel.findOne({ _id: goalId, userId });

    if (!goal) {
      throw new NotFoundException('Meta não encontrada');
    }

    if (goal.status !== 'active') {
      throw new BadRequestException('Meta não está mais ativa');
    }

    if (amountCents <= 0) {
      throw new BadRequestException('Valor deve ser maior que zero');
    }

    goal.currentAmountCents += amountCents;

    // Verificar se atingiu a meta
    if (goal.currentAmountCents >= goal.targetAmountCents) {
      goal.currentAmountCents = goal.targetAmountCents;
      goal.status = 'completed';
    }

    await goal.save();

    return {
      message:
        goal.status === 'completed'
          ? 'Meta alcançada! Parabéns! 🎉'
          : 'Contribuição adicionada com sucesso!',
      goal,
      progressPercentage: this.calculateProgress(goal),
    };
  }

  async updateGoal(
    userId: Types.ObjectId,
    goalId: string,
    dto: UpdateGoalDto,
  ) {
    const goal = await this.goalModel.findOne({ _id: goalId, userId });

    if (!goal) {
      throw new NotFoundException('Meta não encontrada');
    }

    Object.assign(goal, {
      ...(dto.name ? { name: dto.name } : {}),
      ...(dto.targetAmountCents ? { targetAmountCents: dto.targetAmountCents } : {}),
      ...(dto.currentAmountCents !== undefined ? { currentAmountCents: dto.currentAmountCents } : {}),
      ...(dto.deadline ? { deadline: new Date(dto.deadline) } : {}),
      ...(dto.status ? { status: dto.status } : {}),
      ...(dto.description !== undefined ? { description: dto.description } : {}),
    });

    await goal.save();

    return {
      ...goal.toObject(),
      progressPercentage: this.calculateProgress(goal),
      daysRemaining: this.calculateDaysRemaining(goal),
    };
  }

  async deleteGoal(userId: Types.ObjectId, goalId: string) {
    const goal = await this.goalModel.findOne({ _id: goalId, userId });

    if (!goal) {
      throw new NotFoundException('Meta não encontrada');
    }

    await goal.deleteOne();

    return { message: 'Meta excluída com sucesso' };
  }
}
