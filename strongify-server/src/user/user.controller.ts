import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, ValidationPipe, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FullUserDto } from './dto/full-user.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { StorageService } from 'src/storage/storage.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService,
              private readonly storage: StorageService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getOne(@CurrentUser() userId: string): Promise<FullUserDto> {
    const user = await this.userService.findOne(userId);
    
    return {
      ...user,
      profileImageUrl: user?.profileImageUrl ? this.storage.getPublicUrl(user.profileImageUrl) : undefined,
    } as FullUserDto;
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Patch()
  async update(
    @CurrentUser() userId: string,
    @Body(ValidationPipe) user: UpdateUserDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
      })
    ) file?: Express.Multer.File
  ) {
    if (file) {
      const { path } = await this.storage.uploadUserAvatar(userId, file);
      await this.userService.updateAvatar(userId, path);
    }

    return this.userService.update(userId, user);
  }

}
