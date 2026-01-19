export interface Exercise {
  id: string;
  name: string;
  muscleGroup?: string;
}

export interface ExerciseSet {
  id: string;
  weight: number;
  reps: number;
  completed: boolean;
}

export interface RoutineExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  sets: number;
  defaultWeight?: number;
  defaultReps?: number;
}

export interface Routine {
  id: string;
  name: string;
  exercises: RoutineExercise[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  sets: ExerciseSet[];
}

export interface WorkoutLog {
  id: string;
  routineId: string;
  routineName: string;
  exercises: WorkoutExercise[];
  startedAt: string;
  completedAt: string;
  duration: number; // in seconds
  totalVolume: number; // total weight x reps
  totalSets: number;
  totalReps: number;
}

export interface ActiveWorkout {
  routineId: string;
  routineName: string;
  exercises: WorkoutExercise[];
  startedAt: string;
}
