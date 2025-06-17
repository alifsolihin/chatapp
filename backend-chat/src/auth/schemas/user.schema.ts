// src/auth/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, unique: true })
  phone: string;

  @Prop({ required: true })
  birthDate: string;

  @Prop()
  profilePic: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: () => uuidv4() })
  userId: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
