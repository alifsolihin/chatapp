// src/chat/chat.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { Chat, ChatSchema } from './schemas/chat.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]),
  ],
  providers: [ChatService, ChatGateway],
})
export class ChatModule {}
