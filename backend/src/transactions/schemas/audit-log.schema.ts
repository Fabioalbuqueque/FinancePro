import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false }, collection: 'auditLogs' })
export class AuditLog {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  actorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Family', index: true })
  familyId?: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['transaction', 'account', 'family', 'member'],
  })
  entityType: string;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  entityId: Types.ObjectId;

  @Prop({ required: true, enum: ['create', 'update', 'delete', 'archive'] })
  action: string;

  @Prop({ type: Object })
  changes?: Record<string, any>;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
AuditLogSchema.index({ entityId: 1, createdAt: -1 });
