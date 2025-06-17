import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { RoomModule } from './room/room.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/chat-realtime'),
    AuthModule,
    RoomModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
