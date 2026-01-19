import { format } from 'date-fns';
import { Clock, Dumbbell, TrendingUp, Repeat } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { WorkoutLog } from '@/types/workout';

interface WorkoutDetailSheetProps {
  log: WorkoutLog | null;
  onClose: () => void;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

export function WorkoutDetailSheet({ log, onClose }: WorkoutDetailSheetProps) {
  if (!log) return null;

  return (
    <Sheet open={!!log} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader className="text-left pb-4">
          <SheetTitle className="text-xl">{log.routineName}</SheetTitle>
          <p className="text-sm text-muted-foreground">
            {format(new Date(log.completedAt), 'EEEE, MMMM d, yyyy · h:mm a')}
          </p>
        </SheetHeader>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="p-3 text-center">
            <Clock className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold">{formatDuration(log.duration)}</p>
            <p className="text-xs text-muted-foreground">Duration</p>
          </Card>
          <Card className="p-3 text-center">
            <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold">{log.totalVolume.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Volume (kg)</p>
          </Card>
          <Card className="p-3 text-center">
            <Dumbbell className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold">{log.totalSets}</p>
            <p className="text-xs text-muted-foreground">Total Sets</p>
          </Card>
          <Card className="p-3 text-center">
            <Repeat className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold">{log.totalReps}</p>
            <p className="text-xs text-muted-foreground">Total Reps</p>
          </Card>
        </div>

        <Separator className="mb-4" />

        <div className="space-y-4 overflow-auto max-h-[calc(85vh-320px)] pb-8">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Exercises
          </h3>
          {log.exercises.map((exercise) => (
            <Card key={exercise.id} className="p-4">
              <h4 className="font-semibold mb-3">{exercise.exerciseName}</h4>
              <div className="space-y-2">
                <div className="grid grid-cols-3 text-xs font-medium text-muted-foreground">
                  <span>Set</span>
                  <span className="text-center">Weight</span>
                  <span className="text-right">Reps</span>
                </div>
                {exercise.sets.map((set, index) => (
                  <div 
                    key={set.id} 
                    className={`grid grid-cols-3 text-sm py-1.5 rounded ${
                      set.completed ? 'text-foreground' : 'text-muted-foreground/50'
                    }`}
                  >
                    <span className="font-medium">{index + 1}</span>
                    <span className="text-center">{set.weight} kg</span>
                    <span className="text-right">{set.reps}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
