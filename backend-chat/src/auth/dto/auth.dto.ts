// src/auth/dto/auth.dto.ts
export class AuthDto {
  username: string;
  fullName: string;
  email: string;
  phone: string;
  birthDate: string;
  profilePic?: string;
  password: string;
}
