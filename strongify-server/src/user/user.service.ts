import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { FullUserDto } from './dto/full-user.dto';
import { BaseService } from 'src/common/services/base.service';
import { UserNotFoundException } from 'src/common/exceptions/business.exceptions';
import { WorkoutRecord } from 'src/workout-record/workout-record.entity';
import { BaseUserDto } from './dto/base-user.dto';

@Injectable()
export class UserService extends BaseService<User> {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
  ) {
    super(repo);
  }

  async create(createUserDto: CreateUserDto): Promise<FullUserDto> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.repo.create({
      ...createUserDto,
      passwordHash: hashedPassword,
    });
    await this.repo.save(user);
    return new FullUserDto(user);
  }

  async findAll(): Promise<BaseUserDto[]> {
    const users = await this.repo.find();
    return users.map((user) => new BaseUserDto(user));
  }

  async findOne(id: string): Promise<FullUserDto | null> {
    const user = await this.repo.findOne({ where: { id }, relations: ['workoutRecords'] });
    return user ? new FullUserDto(user) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.repo.findOne({ where: { username } });
  }

  async update(id: string, user: UpdateUserDto): Promise<FullUserDto> {
    const existingUser = await this.repo.findOneBy({ id });
    if (!existingUser) {
      throw new UserNotFoundException(id);
    }
    const updatedUser = this.repo.merge(existingUser, user);
    const savedUser = await this.repo.save(updatedUser);
    return new FullUserDto(savedUser);
  }

  async updateAvatar(id: string, avatarPath: string): Promise<void> {
    const existingUser = await this.repo.findOneBy({ id });
    if (!existingUser) {
      throw new UserNotFoundException(id);
    }
    await this.repo.update({ id }, { profileImageUrl: avatarPath });
  }
}
