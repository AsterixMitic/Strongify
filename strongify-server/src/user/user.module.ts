import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { StorageModule } from 'src/storage/storage.module';

@Module({
  imports:[TypeOrmModule.forFeature([User]), StorageModule],
  controllers: [UserController],
  providers: [UserService,],
  exports: [UserService],
})
export class UserModule {}
