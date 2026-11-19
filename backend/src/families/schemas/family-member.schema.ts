import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FamilyMemberDocument = FamilyMember & Document;

@Schema({ timestamps: true, collection: 'familyMembers' })
export class FamilyMember {
  @Prop({ type: Types.ObjectId, ref: 'Family', required: true, index: true })
  familyId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: ['admin', 'member'], default: 'member' })
  role: string;

  @Prop({ required: true, enum: ['active', 'pending', 'removed'], default: 'active', index: true })
  status: string;

  @Prop()
  joinedAt?: Date;
}

export const FamilyMemberSchema = SchemaFactory.createForClass(FamilyMember);
FamilyMemberSchema.index({ familyId: 1, userId: 1 }, { unique: true });
