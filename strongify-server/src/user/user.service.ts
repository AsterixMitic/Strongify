import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { FullUserDto } from './dto/full-user.dto';

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User)
    private repo: Repository<User>
  ){
  }

  async create(createUserDto: CreateUserDto): Promise<FullUserDto> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.repo.create({ ...createUserDto, passwordHash: hashedPassword });
    await this.repo.save(user);
    return new FullUserDto(user);
  }

  async findAll(): Promise<FullUserDto[]> {
    const users = await this.repo.find();
    return users.map(user => new FullUserDto(user));
  }

  async findOne(id: string): Promise<FullUserDto | null> {
    const user = await this.repo.findOne({ where: { id } });
    return user ? new FullUserDto(user) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.repo.findOne({ where: { username } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<FullUserDto | null> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) return null;

    Object.assign(user, updateUserDto);
    await this.repo.save(user);
    return new FullUserDto(user);
  }

  async remove(id: string): Promise<boolean> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) return false;

    await this.repo.remove(user);
    return true;
  }
}
