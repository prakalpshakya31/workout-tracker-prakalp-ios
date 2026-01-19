import { useState } from 'react';
import { Plus, Play, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Routine, WorkoutLog } from '@/types/workout';
import { CreateRoutineSheet } from '@/components/routines/CreateRoutineSheet';
import { EditRoutineSheet } from '@/components/routines/EditRoutineSheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

interface RoutinesPageProps {
  routines: Routine[];
  onAddRoutine: (routine: Routine) => void;
  onUpdateRoutine: (routine: Routine) => void;
  onDeleteRoutine: (id: string) => void;
  onStartWorkout: (routine: Routine, previousLog?: WorkoutLog) => void;
  getLastWorkoutForRoutine: (routineId: string) => WorkoutLog | undefined;
}

export function RoutinesPage({
  routines,
  onAddRoutine,
  onUpdateRoutine,
  onDeleteRoutine,
  onStartWorkout,
  getLastWorkoutForRoutine,
}: RoutinesPageProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [deleteRoutineId, setDeleteRoutineId] = useState<string | null>(null);

  const handleStartWorkout = (routine: Routine) => {
    const previousLog = getLastWorkoutForRoutine(routine.id);
    onStartWorkout(routine, previousLog);
  };

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        title="Routines"
        subtitle="Your workout templates"
        action={
          <Button size="sm" onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
        }
      />

      <div className="flex-1 p-4 space-y-3">
        {routines.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-1">No routines yet</h3>
            <p className="text-muted-foreground text-sm max-w-[240px] mb-4">
              Create your first workout routine to start tracking
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Create Routine
            </Button>
          </div>
        ) : (
          routines.map((routine) => (
            <Card key={routine.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{routine.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {routine.exercises.length} exercise{routine.exercises.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditingRoutine(routine)}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setDeleteRoutineId(routine.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {routine.exercises.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {routine.exercises.slice(0, 4).map((ex) => (
                    <span
                      key={ex.id}
                      className="px-2 py-1 text-xs bg-secondary rounded-md"
                    >
                      {ex.exerciseName}
                    </span>
                  ))}
                  {routine.exercises.length > 4 && (
                    <span className="px-2 py-1 text-xs bg-secondary rounded-md text-muted-foreground">
                      +{routine.exercises.length - 4} more
                    </span>
                  )}
                </div>
              )}

              <Button
                className="w-full gradient-primary"
                onClick={() => handleStartWorkout(routine)}
                disabled={routine.exercises.length === 0}
              >
                <Play className="w-4 h-4 mr-2" />
                Start Workout
              </Button>
            </Card>
          ))
        )}
      </div>

      <CreateRoutineSheet
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSave={onAddRoutine}
      />

      <EditRoutineSheet
        routine={editingRoutine}
        onClose={() => setEditingRoutine(null)}
        onSave={onUpdateRoutine}
      />

      <AlertDialog open={!!deleteRoutineId} onOpenChange={() => setDeleteRoutineId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete routine?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this routine. Your workout logs using this routine will be kept.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteRoutineId) {
                  onDeleteRoutine(deleteRoutineId);
                  setDeleteRoutineId(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
