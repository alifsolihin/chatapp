// src/auth/auth.service.ts
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from './schemas/user.schema';
import { AuthDto } from './dto/auth.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async register(dto: AuthDto) {
    const { username, email, phone } = dto;

    const exist = await this.userModel.findOne({
      $or: [{ email }, { username }, { phone }],
    });
    if (exist) {
      throw new ConflictException(
        'Email, Username, atau No Telpon sudah digunakan',
      );
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const createdUser = new this.userModel({
      ...dto,
      password: hashed,
    });

    await createdUser.save();

    return { message: 'User registered successfully' };
  }

  async login(username: string, password: string) {
    const user = await this.userModel.findOne({ username });
    if (!user) throw new UnauthorizedException('Username salah');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Password salah');

    const token = this.jwtService.sign({
      id: user._id,
      username: user.username,
    });

    return {
      message: 'Login berhasil',
      token,
      user: {
        username: user.username,
        fullName: user.fullName,
        userId: user.userId,
        email: user.email,
        phone: user.phone,
        birthDate: user.birthDate,
        profilePic: user.profilePic,
      },
    };
  }
}
