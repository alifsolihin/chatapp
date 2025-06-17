// src/chat/chat.gateway.ts
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server;

  private onlineUsers = new Map<string, Set<string>>();
  private clientInfo = new Map<string, { room: string; user: string }>();
  private pinnedMessages = new Map<string, any>();

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    const info = this.clientInfo.get(client.id);
    if (info) {
      const { room, user } = info;

      const users = this.onlineUsers.get(room);
      if (users) {
        users.delete(user);
        if (users.size === 0) {
          this.onlineUsers.delete(room);
        }
        this.server.to(room).emit('onlineUsers', Array.from(users));
      }

      client.leave(room);
      this.clientInfo.delete(client.id);
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() data: { room: string; user: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { room, user } = data;

    client.join(room);
    this.clientInfo.set(client.id, { room, user });

    if (!this.onlineUsers.has(room)) {
      this.onlineUsers.set(room, new Set());
    }
    this.onlineUsers.get(room)!.add(user);

    this.server
      .to(room)
      .emit('onlineUsers', Array.from(this.onlineUsers.get(room)!));

    const messages = await this.chatService.getLastMessages(room);
    client.emit('roomMessages', messages);

    const pinned = this.pinnedMessages.get(room);
    if (pinned) {
      client.emit('pinnedMessage', pinned);
    }
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() data: { room: string; user: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { room, user } = data;

    client.leave(room);

    const users = this.onlineUsers.get(room);
    if (users) {
      users.delete(user);
      if (users.size === 0) {
        this.onlineUsers.delete(room);
      }
      this.server.to(room).emit('onlineUsers', Array.from(users));
    }

    this.clientInfo.delete(client.id);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody()
    data: {
      room: string;
      sender: string;
      content: string;
      replyTo?: any;
    },
  ) {
    const saved = await this.chatService.saveMessage(data);
    this.server.to(data.room).emit('newMessage', saved);

    const roomUsers = this.onlineUsers.get(data.room);
    if (roomUsers) {
      for (const username of roomUsers) {
        if (username !== data.sender) {
          const count = await this.chatService.countUnreadMessages(
            data.room,
            username,
          );
          this.server
            .to(data.room)
            .emit('unreadCount', { room: data.room, count });
        }
      }
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { room: string; user: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.to(data.room).emit('userTyping', data.user);
  }

  @SubscribeMessage('stopTyping')
  handleStopTyping(
    @MessageBody() data: { room: string; user: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.to(data.room).emit('userStopTyping', data.user);
  }

  @SubscribeMessage('pinMessage')
  handlePinMessage(
    @MessageBody() data: { room: string; message: any },
    @ConnectedSocket() client: Socket,
  ) {
    this.pinnedMessages.set(data.room, data.message);
    this.server.to(data.room).emit('pinnedMessage', data.message);
  }

  @SubscribeMessage('editMessage')
  async handleEditMessage(
    @MessageBody() data: { id: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const updated = await this.chatService.editMessage(data.id, data.content);
    if (updated) {
      this.server.to(updated.room).emit('messageEdited', updated);
    }
  }

  @SubscribeMessage('messageRead')
  async handleMessageRead(
    @MessageBody() data: { messageId: string; username: string },
    @ConnectedSocket() client: Socket,
  ) {
    const info = this.clientInfo.get(client.id);
    if (!info) return;

    const { room } = info;
    const updated = await this.chatService.markMessageAsRead(
      data.messageId,
      data.username,
    );

    if (updated) {
      this.server.to(room).emit('messageReadUpdate', {
        messageId: updated._id,
        readBy: updated.readBy,
        room,
      });

      const count = await this.chatService.countUnreadMessages(
        room,
        data.username,
      );
      client.emit('unreadCount', { room, count });
    }
  }

  @SubscribeMessage('getUnreadCount')
  async handleGetUnreadCount(
    @MessageBody() data: { room: string; username: string },
    @ConnectedSocket() client: Socket,
  ) {
    const count = await this.chatService.countUnreadMessages(
      data.room,
      data.username,
    );
    client.emit('unreadCount', { room: data.room, count });
  }

  
}
