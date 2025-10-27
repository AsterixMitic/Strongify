import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {TypeOrmModule} from '@nestjs/typeorm'
import { UserModule } from './user/user.module';
import { WorkoutRecordModule } from './workout-record/workout-record.module';
import { LocationModule } from './location/location.module';
import { WorkoutRecord } from './workout-record/workout-record.entity';
import { User } from './user/user.entity';
import { Location } from './location/location.entity'
import { ExerciseTypeModule } from './exercise-type/exercise-type.module';
import { LeaderboardEntryModule } from './leaderboard-entry/leaderboard-entry.module';
import { ExerciseType } from './exercise-type/exercise-type.entity';
import { LeaderboardEntry } from './leaderboard-entry/leaderboard-entry.entity';
import { AuthModule } from './auth/auth.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST')!,
        port: +
        config.get<string>('DB_PORT')!,
        username: config.get<string>('DB_USERNAME')!,
        password: config.get<string>('DB_PASSWORD')!,
        database: config.get<string>('DB_DATABASE')!,
        entities: [User, WorkoutRecord, Location, ExerciseType, LeaderboardEntry],
        synchronize: false,
      }),
      inject: [ConfigService],  
    }),
    UserModule,
    WorkoutRecordModule,
    LocationModule,
    ExerciseTypeModule,
    LeaderboardEntryModule,
    AuthModule,
    StorageModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
