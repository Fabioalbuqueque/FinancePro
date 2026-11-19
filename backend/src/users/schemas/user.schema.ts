import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ _id: false })
export class UserPreferences {
  @Prop({ default: 'system', enum: ['light', 'dark', 'system'] })
  theme: string;

  @Prop({ default: 'BRL' })
  currency: string;

  @Prop({ default: 'pt-BR' })
  language: string;
}

export const UserPreferencesSchema = SchemaFactory.createForClass(UserPreferences);

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, unique: true, index: true })
  firebaseUid: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, index: true, lowercase: true, trim: true })
  email: string;

  @Prop({ type: UserPreferencesSchema, default: () => ({}) })
  preferences: UserPreferences;

  @Prop({ default: 'active', enum: ['active', 'disabled'], index: true })
  status: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
