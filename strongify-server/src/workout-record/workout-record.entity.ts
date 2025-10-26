import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Location } from '../location/location.entity';

export enum ExerciseType {
  PULL_UPS = 'pull_ups',
  PUSH_UPS = 'push_ups',
  SQUATS = 'squats',
  DEADLIFT = 'deadlift',
  BENCH_PRESS = 'bench_press',
  RUNNING = 'running',
  PLANK = 'plank',
  BURPEES = 'burpees',
  MOUNTAIN_CLIMBERS = 'mountain_climbers',
  JUMPING_JACKS = 'jumping_jacks'
}

@Entity('workout_records')
export class WorkoutRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  exerciseType: ExerciseType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number;

  @Column()
  unit: string; // reps, kg, seconds, minutes, km

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  videoUrl: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ default: 0 })
  points: number;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  verifiedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, user => user.workoutRecords)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Location, location => location.workoutRecords)
  @JoinColumn({ name: 'locationId' })
  location: Location;

  @Column()
  locationId: string;
}
