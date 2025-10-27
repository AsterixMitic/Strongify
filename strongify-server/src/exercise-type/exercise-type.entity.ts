import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, Index
} from 'typeorm';
import { WorkoutRecord } from 'src/workout-record/workout-record.entity';
import { LeaderboardEntry } from 'src/leaderboard-entry/leaderboard-entry.entity';

@Entity('exercise_types')
@Index('UQ_exercise_types_name', ['name'], { unique: true })
export class ExerciseType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ name: 'measures_reps', type: 'boolean', default: false })
  measuresReps: boolean;

  @Column({ name: 'measures_weight', type: 'boolean', default: true })
  measuresWeight: boolean;

  @Column({ name: 'measures_time', type: 'boolean', default: false })
  measuresTime: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => WorkoutRecord, (wr) => wr.exerciseType)
  workoutRecords: WorkoutRecord[];

  @OneToMany(() => LeaderboardEntry, (le) => le.exerciseType)
  leaderboardEntries: LeaderboardEntry[];
}
