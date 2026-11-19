import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AccountDocument = Account & Document;

@Schema({ timestamps: true, collection: 'accounts' })
export class Account {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, enum: ['user', 'family'], default: 'user', index: true })
  ownerType: string;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  ownerId: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['cash', 'checking', 'savings', 'digital'],
    default: 'checking',
  })
  type: string;

  @Prop({ required: true, default: 0 })
  initialBalanceCents: number;

  @Prop({ required: true, enum: ['active', 'archived'], default: 'active', index: true })
  status: string;
}

export const AccountSchema = SchemaFactory.createForClass(Account);
AccountSchema.index({ ownerId: 1, status: 1 });
