// src/chat/chat.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Chat, ChatDocument } from './schemas/chat.schema';
import { Model } from 'mongoose';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(@InjectModel(Chat.name) private chatModel: Model<ChatDocument>) {}

  async saveMessage(data: {
    room: string;
    sender: string;
    content: string;
    replyTo?: { sender: string; content: string };
  }) {
    const newMsg = new this.chatModel({
      room: data.room,
      sender: data.sender,
      content: data.content,
      replyTo: data.replyTo,
      readBy: [data.sender],
      createdAt: new Date(),
    });

    return await newMsg.save();
  }

  async getLastMessages(room: string) {
    try {
      const messages = await this.chatModel
        .find({ room })
        .sort({ createdAt: 1 })
        .limit(100)
        .lean();

      this.logger.log(
        `📨 Mengambil ${messages.length} pesan untuk room "${room}"`,
      );
      return messages;
    } catch (error) {
      this.logger.error('❌ Gagal mengambil pesan:', error.message);
      return [];
    }
  }

  async editMessage(id: string, content: string) {
    return this.chatModel
      .findByIdAndUpdate(
        id,
        {
          content,
          edited: true,
          editedAt: new Date(),
        },
        { new: true },
      )
      .lean();
  }

  async markMessageAsRead(messageId: string, username: string) {
    const msg = await this.chatModel.findById(messageId);

    if (!msg) {
      this.logger.warn(`Pesan dengan ID ${messageId} tidak ditemukan.`);
      return null;
    }

    if (!msg.readBy) {
      msg.readBy = [];
    }

    if (!msg.readBy.includes(username)) {
      msg.readBy.push(username);
      await msg.save();
      this.logger.log(`👁️‍🗨️ ${username} membaca pesan ${messageId}`);
    }

    return msg.toObject();
  }

  async countUnreadMessages(room: string, username: string): Promise<number> {
    return this.chatModel.countDocuments({
      room,
      sender: { $ne: username },
      $or: [
        { readBy: { $exists: false } },
        { readBy: { $not: { $in: [username] } } },
      ],
    });
  }


}
