// src/room/room.controller.ts
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';

@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post('create')
  createRoom(@Body() dto: CreateRoomDto) {
    return this.roomService.createRoom(dto);
  }

  @Get('list')
  getMyRooms(@Query('username') username: string) {
    return this.roomService.getRoomsByUser(username);
  }

  @Post('add-member')
  addMember(
    @Body() data: { roomName: string; username: string; requester: string },
  ) {
    return this.roomService.addMember(
      data.roomName,
      data.username,
      data.requester,
    );
  }

  @Get(':name')
  getRoomByName(@Param('name') name: string) {
    return this.roomService.getRoomByName(name);
  }

  @Get('detail/:roomName')
  getRoomDetail(@Param('roomName') name: string) {
    return this.roomService.getRoomDetail(name);
  }

  @Post('remove-member')
  removeMember(
    @Body() data: { roomName: string; username: string; requester: string },
  ) {
    return this.roomService.removeMember(
      data.roomName,
      data.username,
      data.requester,
    );
  }

  @Post('delete')
  deleteRoom(@Body() data: { roomName: string; requester: string }) {
    return this.roomService.deleteRoom(data.roomName, data.requester);
  }

  @Post('rename')
  async renameRoom(
    @Body() body: { oldName: string; newName: string; requester: string },
  ) {
    return this.roomService.renameRoom(
      body.oldName,
      body.newName,
      body.requester,
    );
  }
}
