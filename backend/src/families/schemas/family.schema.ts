import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FamilyDocument = Family & Document;

@Schema({ timestamps: true, collection: 'families' })
export class Family {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  ownerId: Types.ObjectId;

  @Prop({ default: 'active', enum: ['active', 'disabled'], index: true })
  status: string;
}

export const FamilySchema = SchemaFactory.createForClass(Family);
