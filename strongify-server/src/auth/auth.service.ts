/* eslint-disable @typescript-eslint/no-unused-vars */
import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { FullUserDto } from 'src/user/dto/full-user.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<Partial<FullUserDto> | null> {
    if (!username || !password) {
      return null;
    }

    const user = await this.userService.findByUsername(username);

    if (!user || !user.passwordHash) {
      throw new BadRequestException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (isPasswordValid) {
      const { ...result } = user;
      return new FullUserDto(result);
    }

    throw new BadRequestException('Incorrect password');
  }
  login(user: Partial<FullUserDto>): { access_token: string } {
    const payload = { email: user.email, sub: user.id };
    const token = this.jwtService.sign(payload);
    return { access_token: token };
  }

  async register(user: CreateUserDto): Promise<FullUserDto> {
    return this.userService.create(user);
  }
}
