import { User } from '../user.entity';

export class FullUserDto {
  id: string;
  username: string;
  email: string;
  profileImageUrl?: string;
  createdAt: Date;

  constructor(entity: User) {
    this.id = entity.id;
    this.username = entity.username;
    this.email = entity.email;
    this.profileImageUrl = entity.profileImageUrl || undefined;
    this.createdAt = entity.createdAt;
  }
}
