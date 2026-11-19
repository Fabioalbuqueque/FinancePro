import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: true, collection: 'transactions' })
export class Transaction {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: ['user', 'family'], index: true })
  ownerType: string;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  ownerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Account', required: true, index: true })
  accountId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Category', index: true })
  categoryId?: Types.ObjectId;

  @Prop({ required: true, enum: ['income', 'expense', 'transfer'], index: true })
  type: string;

  @Prop({ required: true, min: 0 })
  amountCents: number;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ required: true, enum: ['pending', 'paid', 'cancelled'], default: 'paid', index: true })
  status: string;

  @Prop({ required: true, index: true })
  date: Date;

  @Prop({ type: Types.ObjectId, ref: 'Transaction', index: true })
  transferId?: Types.ObjectId;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
TransactionSchema.index({ ownerId: 1, date: -1 });
TransactionSchema.index({ accountId: 1, date: -1 });
