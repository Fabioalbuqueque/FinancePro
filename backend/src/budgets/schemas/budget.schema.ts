import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface BudgetDocument extends Document {
  userId: Types.ObjectId;
  month: number;
  year: number;
  totalBudgetCents: number;
  categoryBudgets: {
    categoryId: Types.ObjectId;
    budgetCents: number;
  }[];
  status: 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

@Schema({ timestamps: true })
export class Budget {
  @Prop({ required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 12 })
  month: number;

  @Prop({ required: true })
  year: number;

  @Prop({ required: true })
  totalBudgetCents: number;

  @Prop({ type: Array })
  categoryBudgets: {
    categoryId: Types.ObjectId;
    budgetCents: number;
  }[];

  @Prop({ default: 'active', enum: ['active', 'archived'] })
  status: string;
}

export const BudgetSchema = SchemaFactory.createForClass(Budget);
