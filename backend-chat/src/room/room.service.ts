// src/room/room.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Room, RoomDocument } from './schemas/room.schema';
import { CreateRoomDto } from './dto/create-room.dto';

@Injectable()
export class RoomService {
  constructor(@InjectModel(Room.name) private roomModel: Model<RoomDocument>) {}

  async createRoom(dto: CreateRoomDto) {
    const existing = await this.roomModel.findOne({ name: dto.name });
    if (existing) throw new BadRequestException('Room sudah ada');

    const room = new this.roomModel({
      name: dto.name,
      admin: dto.admin,
      members: [dto.admin],
    });

    return await room.save();
  }

  async getRoomsByUser(username: string) {
    return await this.roomModel
      .find({
        $or: [{ admin: username }, { members: username }],
      })
      .sort({ createdAt: -1 });
  }

  async addMember(roomName: string, username: string, requester: string) {
    const room = await this.roomModel.findOne({ name: roomName });
    if (!room) throw new NotFoundException('Room tidak ditemukan');

    if (room.admin !== requester) {
      throw new BadRequestException(
        'Hanya admin yang dapat menambahkan member',
      );
    }

    if (room.members.includes(username)) {
      throw new BadRequestException('User sudah menjadi member');
    }

    room.members.push(username);
    return await room.save();
  }

  async getRoomByName(name: string) {
    const room = await this.roomModel.findOne({ name });
    if (!room) throw new NotFoundException('Room tidak ditemukan');
    return room;
  }

  async getRoomDetail(name: string) {
    const room = await this.roomModel.findOne({ name }).lean();
    if (!room) throw new NotFoundException('Room tidak ditemukan');
    return room;
  }

  async removeMember(roomName: string, username: string, requester: string) {
    const room = await this.roomModel.findOne({ name: roomName });

    if (!room) {
      throw new NotFoundException('Room tidak ditemukan');
    }

    if (room.admin !== requester) {
      throw new ForbiddenException('Hanya admin yang bisa menghapus member');
    }

    if (username === room.admin) {
      throw new ForbiddenException(
        'Admin tidak dapat menghapus dirinya sendiri',
      );
    }

    const updatedMembers = room.members.filter((member) => member !== username);
    room.members = updatedMembers;
    await room.save();

    return {
      message: `Member ${username} berhasil dihapus dari room ${roomName}`,
      members: room.members,
    };
  }

  async deleteRoom(roomName: string, requester: string) {
    const room = await this.roomModel.findOne({ name: roomName });
    if (!room) throw new NotFoundException('Room tidak ditemukan');
    if (room.admin !== requester) {
      throw new ForbiddenException('Hanya admin yang dapat menghapus room');
    }
    await this.roomModel.deleteOne({ name: roomName });
    return { message: 'Room berhasil dihapus' };
  }

  async renameRoom(oldName: string, newName: string, requester: string) {
    const room = await this.roomModel.findOne({ name: oldName });
    if (!room) throw new NotFoundException('Room tidak ditemukan');

    if (!room.admin.includes(requester)) {
      throw new ForbiddenException('Hanya admin yang dapat mengubah nama room');
    }

    const existing = await this.roomModel.findOne({ name: newName });
    if (existing) throw new BadRequestException('Nama room sudah dipakai');

    room.name = newName;
    await room.save();
    return { message: 'Nama room berhasil diubah' };
  }
}
