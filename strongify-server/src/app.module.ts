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
        entities: [User, WorkoutRecord, Location],
        synchronize: false,
      }),
      inject: [ConfigService],  
    }),
    UserModule,
    WorkoutRecordModule,
    LocationModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
