import { useState, useEffect, useCallback } from 'react';
import { Routine, WorkoutLog, ActiveWorkout, WorkoutExercise, ExerciseSet } from '@/types/workout';

const STORAGE_KEYS = {
  ROUTINES: 'ironlog_routines',
  LOGS: 'ironlog_logs',
  ACTIVE_WORKOUT: 'ironlog_active_workout',
};

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to storage:', error);
  }
}

export function useRoutines() {
  const [routines, setRoutines] = useState<Routine[]>(() => 
    loadFromStorage(STORAGE_KEYS.ROUTINES, [])
  );

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ROUTINES, routines);
  }, [routines]);

  const addRoutine = useCallback((routine: Routine) => {
    setRoutines(prev => [...prev, routine]);
  }, []);

  const updateRoutine = useCallback((routine: Routine) => {
    setRoutines(prev => prev.map(r => r.id === routine.id ? routine : r));
  }, []);

  const deleteRoutine = useCallback((id: string) => {
    setRoutines(prev => prev.filter(r => r.id !== id));
  }, []);

  return { routines, addRoutine, updateRoutine, deleteRoutine };
}

export function useWorkoutLogs() {
  const [logs, setLogs] = useState<WorkoutLog[]>(() => 
    loadFromStorage(STORAGE_KEYS.LOGS, [])
  );

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.LOGS, logs);
  }, [logs]);

  const addLog = useCallback((log: WorkoutLog) => {
    setLogs(prev => [log, ...prev]);
  }, []);

  const deleteLog = useCallback((id: string) => {
    setLogs(prev => prev.filter(l => l.id !== id));
  }, []);

  const getLastWorkoutForRoutine = useCallback((routineId: string): WorkoutLog | undefined => {
    return logs.find(log => log.routineId === routineId);
  }, [logs]);

  return { logs, addLog, deleteLog, getLastWorkoutForRoutine };
}

export function useActiveWorkout() {
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(() => 
    loadFromStorage(STORAGE_KEYS.ACTIVE_WORKOUT, null)
  );

  useEffect(() => {
    if (activeWorkout) {
      saveToStorage(STORAGE_KEYS.ACTIVE_WORKOUT, activeWorkout);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);
    }
  }, [activeWorkout]);

  const startWorkout = useCallback((routine: Routine, previousLog?: WorkoutLog) => {
    const exercises: WorkoutExercise[] = routine.exercises.map(ex => {
      const previousExercise = previousLog?.exercises.find(e => e.exerciseId === ex.exerciseId);
      const sets: ExerciseSet[] = Array.from({ length: ex.sets }, (_, i) => {
        const prevSet = previousExercise?.sets[i];
        return {
          id: crypto.randomUUID(),
          weight: prevSet?.weight ?? ex.defaultWeight ?? 0,
          reps: prevSet?.reps ?? ex.defaultReps ?? 0,
          completed: false,
        };
      });
      return {
        id: crypto.randomUUID(),
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName,
        sets,
      };
    });

    setActiveWorkout({
      routineId: routine.id,
      routineName: routine.name,
      exercises,
      startedAt: new Date().toISOString(),
    });
  }, []);

  const updateExerciseSet = useCallback((exerciseId: string, setId: string, updates: Partial<ExerciseSet>) => {
    setActiveWorkout(prev => {
      if (!prev) return null;
      return {
        ...prev,
        exercises: prev.exercises.map(ex => {
          if (ex.id !== exerciseId) return ex;
          return {
            ...ex,
            sets: ex.sets.map(set => {
              if (set.id !== setId) return set;
              return { ...set, ...updates };
            }),
          };
        }),
      };
    });
  }, []);

  const addSetToExercise = useCallback((exerciseId: string) => {
    setActiveWorkout(prev => {
      if (!prev) return null;
      return {
        ...prev,
        exercises: prev.exercises.map(ex => {
          if (ex.id !== exerciseId) return ex;
          const lastSet = ex.sets[ex.sets.length - 1];
          return {
            ...ex,
            sets: [...ex.sets, {
              id: crypto.randomUUID(),
              weight: lastSet?.weight ?? 0,
              reps: lastSet?.reps ?? 0,
              completed: false,
            }],
          };
        }),
      };
    });
  }, []);

  const removeSetFromExercise = useCallback((exerciseId: string, setId: string) => {
    setActiveWorkout(prev => {
      if (!prev) return null;
      return {
        ...prev,
        exercises: prev.exercises.map(ex => {
          if (ex.id !== exerciseId) return ex;
          return {
            ...ex,
            sets: ex.sets.filter(set => set.id !== setId),
          };
        }),
      };
    });
  }, []);

  const finishWorkout = useCallback((): WorkoutLog | null => {
    if (!activeWorkout) return null;

    const completedAt = new Date().toISOString();
    const startTime = new Date(activeWorkout.startedAt).getTime();
    const endTime = new Date(completedAt).getTime();
    const duration = Math.floor((endTime - startTime) / 1000);

    let totalVolume = 0;
    let totalSets = 0;
    let totalReps = 0;

    activeWorkout.exercises.forEach(ex => {
      ex.sets.forEach(set => {
        if (set.completed) {
          totalVolume += set.weight * set.reps;
          totalSets += 1;
          totalReps += set.reps;
        }
      });
    });

    const log: WorkoutLog = {
      id: crypto.randomUUID(),
      routineId: activeWorkout.routineId,
      routineName: activeWorkout.routineName,
      exercises: activeWorkout.exercises,
      startedAt: activeWorkout.startedAt,
      completedAt,
      duration,
      totalVolume,
      totalSets,
      totalReps,
    };

    setActiveWorkout(null);
    return log;
  }, [activeWorkout]);

  const cancelWorkout = useCallback(() => {
    setActiveWorkout(null);
  }, []);

  return {
    activeWorkout,
    startWorkout,
    updateExerciseSet,
    addSetToExercise,
    removeSetFromExercise,
    finishWorkout,
    cancelWorkout,
  };
}
