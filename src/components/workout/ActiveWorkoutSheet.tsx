import { useState, useEffect } from 'react';
import { X, Plus, Minus, Check, Timer, Pause, Play } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ActiveWorkout, ExerciseSet, WorkoutLog } from '@/types/workout';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ActiveWorkoutSheetProps {
  workout: ActiveWorkout | null;
  onUpdateSet: (exerciseId: string, setId: string, updates: Partial<ExerciseSet>) => void;
  onAddSet: (exerciseId: string) => void;
  onRemoveSet: (exerciseId: string, setId: string) => void;
  onFinish: () => WorkoutLog | null;
  onCancel: () => void;
  onLogSaved: (log: WorkoutLog) => void;
}

function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function ActiveWorkoutSheet({
  workout,
  onUpdateSet,
  onAddSet,
  onRemoveSet,
  onFinish,
  onCancel,
  onLogSaved,
}: ActiveWorkoutSheetProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showFinishDialog, setShowFinishDialog] = useState(false);

  useEffect(() => {
    if (!workout) {
      setElapsedTime(0);
      setIsPaused(false);
      return;
    }

    const startTime = new Date(workout.startedAt).getTime();
    setElapsedTime(Math.floor((Date.now() - startTime) / 1000));

    const interval = setInterval(() => {
      if (!isPaused) {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [workout, isPaused]);

  const handleFinish = () => {
    const log = onFinish();
    if (log) {
      onLogSaved(log);
    }
    setShowFinishDialog(false);
  };

  const completedSets = workout?.exercises.reduce(
    (total, ex) => total + ex.sets.filter((s) => s.completed).length,
    0
  ) ?? 0;

  const totalSets = workout?.exercises.reduce(
    (total, ex) => total + ex.sets.length,
    0
  ) ?? 0;

  if (!workout) return null;

  return (
    <>
      <Sheet open={!!workout} onOpenChange={() => setShowCancelDialog(true)}>
        <SheetContent side="bottom" className="h-[95vh] rounded-t-3xl p-0">
          {/* Fixed Header */}
          <div className="sticky top-0 z-10 bg-background border-b border-border">
            <SheetHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-lg">{workout.routineName}</SheetTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCancelDialog(true)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </SheetHeader>

            {/* Timer Bar */}
            <div className="px-4 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-primary">
                  <Timer className="w-5 h-5" />
                  <span className="font-mono text-xl font-bold">{formatTime(elapsedTime)}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsPaused(!isPaused)}
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                {completedSets}/{totalSets} sets
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-auto h-[calc(95vh-180px)] p-4 space-y-4">
            {workout.exercises.map((exercise) => (
              <Card key={exercise.id} className="p-4">
                <h3 className="font-semibold mb-4">{exercise.exerciseName}</h3>

                <div className="space-y-3">
                  {/* Header */}
                  <div className="grid grid-cols-[40px_1fr_1fr_40px_32px] gap-2 text-xs font-medium text-muted-foreground px-1">
                    <span>Set</span>
                    <span className="text-center">kg</span>
                    <span className="text-center">Reps</span>
                    <span className="text-center">✓</span>
                    <span></span>
                  </div>

                  {/* Sets */}
                  {exercise.sets.map((set, index) => (
                    <div
                      key={set.id}
                      className={`grid grid-cols-[40px_1fr_1fr_40px_32px] gap-2 items-center p-2 rounded-lg transition-colors ${
                        set.completed ? 'bg-primary/10' : 'bg-secondary/50'
                      }`}
                    >
                      <span className="font-medium text-center">{index + 1}</span>
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        value={set.weight || ''}
                        onChange={(e) =>
                          onUpdateSet(exercise.id, set.id, {
                            weight: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="h-10 text-center"
                        placeholder="0"
                      />
                      <Input
                        type="number"
                        min="0"
                        value={set.reps || ''}
                        onChange={(e) =>
                          onUpdateSet(exercise.id, set.id, {
                            reps: parseInt(e.target.value) || 0,
                          })
                        }
                        className="h-10 text-center"
                        placeholder="0"
                      />
                      <div className="flex justify-center">
                        <Checkbox
                          checked={set.completed}
                          onCheckedChange={(checked) =>
                            onUpdateSet(exercise.id, set.id, { completed: !!checked })
                          }
                          className="h-6 w-6 rounded-full data-[state=checked]:bg-primary"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => onRemoveSet(exercise.id, set.id)}
                        disabled={exercise.sets.length <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => onAddSet(exercise.id)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Set
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Fixed Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-background safe-bottom">
            <Button
              className="w-full gradient-primary h-12 text-base"
              onClick={() => setShowFinishDialog(true)}
              disabled={completedSets === 0}
            >
              <Check className="w-5 h-5 mr-2" />
              Finish Workout
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel workout?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel? Your progress will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Workout</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={onCancel}
            >
              Cancel Workout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Finish Dialog */}
      <AlertDialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finish workout?</AlertDialogTitle>
            <AlertDialogDescription>
              You've completed {completedSets} of {totalSets} sets. Ready to log this workout?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Going</AlertDialogCancel>
            <AlertDialogAction onClick={handleFinish}>
              Finish & Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
