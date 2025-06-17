// src/room/dto/create-room.dto.ts
export class CreateRoomDto {
  name: string;
  admin: string;
  members?: string[];
}
