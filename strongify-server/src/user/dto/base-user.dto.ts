import { WorkoutRecord } from 'src/workout-record/workout-record.entity';
import { User } from '../user.entity';

export class BaseUserDto {
  username: string;
  email: string;
  profileImageUrl?: string;


  constructor(entity: User) {
    this.username = entity.username;
    this.email = entity.email;
    this.profileImageUrl = entity.profileImageUrl || undefined;
  }
}
