import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, Index,
  JoinColumn
} from 'typeorm';
import { User } from 'src/user/user.entity';
import { Location } from 'src/location/location.entity';
import { ExerciseType } from 'src/exercise-type/exercise-type.entity';

@Entity('workout_records')
@Index('idx_workout_user', ['user'])
@Index('idx_workout_location', ['location'])
@Index('idx_workout_exercise', ['exerciseType'])
export class WorkoutRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (u) => u.workoutRecords, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Location, (l) => l.workoutRecords, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'location_id' })
  location?: Location | null;

  @ManyToOne(() => ExerciseType, (t) => t.workoutRecords, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({name:'exercise_type_id'})
  exerciseType: ExerciseType;

  @Column({
    name: 'weight_kg',
    type: 'numeric',
    precision: 6,
    scale: 2,
    nullable: true,
  })
  weightKg?: number | null;

  @Column({ type: 'int', nullable: true })
  reps?: number | null;

  @Column({
    name: 'duration_sec',
    type: 'numeric',
    precision: 8,
    scale: 2,
    nullable: true,
  })
  durationSec?: number | null;

  @Column({
    type: 'numeric',
    precision: 3,
    scale: 1,
    nullable: true,
  })
  rpe?: number | null;

  @Column({
    name: 'calculated_1rm',
    type: 'numeric',
    precision: 6,
    scale: 2,
    nullable: true,
  })
  calculated1rm?: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
