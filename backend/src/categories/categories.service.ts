import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { FamiliesService } from '../families/families.service';

@Injectable()
export class CategoriesService implements OnModuleInit {
  constructor(
    @InjectModel(Category.name) private readonly categoryModel: Model<CategoryDocument>,
    private readonly familiesService: FamiliesService,
  ) {}

  async onModuleInit() {
    await this.seedDefaultCategories();
  }

  private async seedDefaultCategories() {
    const count = await this.categoryModel.countDocuments({ scope: 'system' });
    if (count > 0) return;

    const defaults = [
      // Receitas
      { name: 'Salário', type: 'income', icon: 'cash' },
      { name: 'Freelance', type: 'income', icon: 'laptop' },
      { name: 'Investimentos', type: 'income', icon: 'trending-up' },
      { name: 'Outros recebimentos', type: 'income', icon: 'gift' },
      // Despesas
      { name: 'Moradia', type: 'expense', icon: 'home' },
      { name: 'Alimentação', type: 'expense', icon: 'restaurant' },
      { name: 'Transporte', type: 'expense', icon: 'car' },
      { name: 'Saúde', type: 'expense', icon: 'medkit' },
      { name: 'Educação', type: 'expense', icon: 'school' },
      { name: 'Lazer', type: 'expense', icon: 'film' },
      { name: 'Contas', type: 'expense', icon: 'receipt' },
      { name: 'Outros', type: 'expense', icon: 'ellipsis-horizontal' },
    ];

    await this.categoryModel.insertMany(
      defaults.map((c) => ({
        ...c,
        scope: 'system',
        isActive: true,
      })),
    );
  }

  async listCategories(userId: Types.ObjectId) {
    const currentFamily = await this.familiesService.getCurrentFamily(userId);
    const familyId = currentFamily ? (currentFamily.family as any)._id : null;

    const conditions: any[] = [
      { scope: 'system', isActive: true },
      { scope: 'user', ownerId: userId, isActive: true },
    ];

    if (familyId) {
      conditions.push({ scope: 'family', ownerId: familyId, isActive: true });
    }

    return this.categoryModel.find({ $or: conditions }).sort({ name: 1 });
  }

  async createCustomCategory(userId: Types.ObjectId, dto: CreateCategoryDto) {
    let ownerId = userId;
    let scope = dto.scope || 'user';

    if (scope === 'family') {
      const currentFamily = await this.familiesService.getCurrentFamily(userId);
      if (currentFamily) {
        ownerId = (currentFamily.family as any)._id;
      }
    }

    return this.categoryModel.create({
      name: dto.name,
      type: dto.type,
      scope,
      ownerId,
      icon: dto.icon || 'bookmark',
      isActive: true,
    });
  }
}
