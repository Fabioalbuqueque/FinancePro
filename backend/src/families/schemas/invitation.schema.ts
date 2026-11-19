import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InvitationDocument = Invitation & Document;

@Schema({ timestamps: true, collection: 'invitations' })
export class Invitation {
  @Prop({ type: Types.ObjectId, ref: 'Family', required: true, index: true })
  familyId: Types.ObjectId;

  @Prop({ required: true, lowercase: true, trim: true, index: true })
  email: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  invitedBy: Types.ObjectId;

  @Prop({ required: true, enum: ['pending', 'accepted', 'rejected'], default: 'pending' })
  status: string;

  @Prop({ required: true, enum: ['admin', 'member'], default: 'member' })
  role: string;
}

export const InvitationSchema = SchemaFactory.createForClass(Invitation);
