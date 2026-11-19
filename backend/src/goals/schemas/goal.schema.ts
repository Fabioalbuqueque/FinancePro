import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface GoalDocument extends Document {
  userId: Types.ObjectId;
  name: string;
  targetAmountCents: number;
  currentAmountCents: number;
  deadline: Date;
  status: 'active' | 'completed' | 'abandoned';
  description?: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Schema({ timestamps: true })
export class Goal {
  @Prop({ required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  targetAmountCents: number;

  @Prop({ default: 0 })
  currentAmountCents: number;

  @Prop({ required: true })
  deadline: Date;

  @Prop({ default: 'active', enum: ['active', 'completed', 'abandoned'] })
  status: string;

  @Prop()
  description?: string;

  @Prop()
  category?: string;
}

export const GoalSchema = SchemaFactory.createForClass(Goal);
