import { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { Clock, Dumbbell, TrendingUp, ChevronRight, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WorkoutLog } from '@/types/workout';
import { WorkoutDetailSheet } from '@/components/log/WorkoutDetailSheet';
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

interface LogPageProps {
  logs: WorkoutLog[];
  onDeleteLog: (id: string) => void;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function LogPage({ logs, onDeleteLog }: LogPageProps) {
  const [selectedLog, setSelectedLog] = useState<WorkoutLog | null>(null);
  const [deleteLogId, setDeleteLogId] = useState<string | null>(null);

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader 
        title="Workout Log" 
        subtitle={`${logs.length} workout${logs.length !== 1 ? 's' : ''} completed`}
      />
      
      <div className="flex-1 p-4 space-y-3">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Dumbbell className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-1">No workouts yet</h3>
            <p className="text-muted-foreground text-sm max-w-[240px]">
              Start a routine to log your first workout and track your progress
            </p>
          </div>
        ) : (
          logs.map((log) => (
            <Card 
              key={log.id} 
              className="p-4 active:scale-[0.98] transition-transform cursor-pointer"
              onClick={() => setSelectedLog(log)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{log.routineName}</h3>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatDistanceToNow(new Date(log.completedAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    {format(new Date(log.completedAt), 'EEEE, MMM d · h:mm a')}
                  </p>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      <span>{formatDuration(log.duration)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Dumbbell className="w-3.5 h-3.5 text-primary" />
                      <span>{log.totalSets} sets</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-primary" />
                      <span>{log.totalVolume.toLocaleString()} kg</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteLogId(log.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <WorkoutDetailSheet 
        log={selectedLog} 
        onClose={() => setSelectedLog(null)} 
      />

      <AlertDialog open={!!deleteLogId} onOpenChange={() => setDeleteLogId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete workout?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this workout from your log. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteLogId) {
                  onDeleteLog(deleteLogId);
                  setDeleteLogId(null);
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
