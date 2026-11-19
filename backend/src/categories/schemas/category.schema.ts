import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true, collection: 'categories' })
export class Category {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, enum: ['income', 'expense'] })
  type: string;

  @Prop({ required: true, enum: ['system', 'user', 'family'], default: 'system' })
  scope: string;

  @Prop({ type: Types.ObjectId, refPath: 'scope' })
  ownerId?: Types.ObjectId;

  @Prop()
  icon?: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
CategorySchema.index({ scope: 1, type: 1, ownerId: 1 });
