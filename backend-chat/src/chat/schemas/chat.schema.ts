// src/chat/schemas/chat.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ChatDocument = Chat & Document;

@Schema()
export class Chat {
  @Prop({ required: true })
  room: string;

  @Prop({ required: true })
  sender: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({
    type: {
      sender: String,
      content: String,
    },
    required: false,
    default: null,
  })
  replyTo?: {
    sender: string;
    content: string;
  };

  @Prop({ type: Boolean, default: false })
  edited: boolean;

  @Prop({ type: Date, default: null })
  editedAt?: Date;

  @Prop({ type: [String], default: [] })
  readBy: string[];
  

}

export const ChatSchema = SchemaFactory.createForClass(Chat);
