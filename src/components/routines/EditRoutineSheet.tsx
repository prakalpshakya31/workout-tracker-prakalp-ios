import { useState, useEffect } from 'react';
import { Plus, X, GripVertical } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Routine, RoutineExercise } from '@/types/workout';

interface EditRoutineSheetProps {
  routine: Routine | null;
  onClose: () => void;
  onSave: (routine: Routine) => void;
}

const SUGGESTED_EXERCISES = [
  'Bench Press', 'Squat', 'Deadlift', 'Overhead Press', 'Barbell Row',
  'Pull-ups', 'Dips', 'Bicep Curls', 'Tricep Extensions', 'Leg Press',
  'Lunges', 'Calf Raises', 'Lat Pulldown', 'Cable Fly', 'Face Pulls',
  'Romanian Deadlift', 'Hip Thrust', 'Leg Curl', 'Leg Extension', 'Plank'
];

export function EditRoutineSheet({ routine, onClose, onSave }: EditRoutineSheetProps) {
  const [name, setName] = useState('');
  const [exercises, setExercises] = useState<RoutineExercise[]>([]);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (routine) {
      setName(routine.name);
      setExercises([...routine.exercises]);
    }
  }, [routine]);

  const filteredSuggestions = SUGGESTED_EXERCISES.filter(
    (ex) =>
      ex.toLowerCase().includes(newExerciseName.toLowerCase()) &&
      !exercises.some((e) => e.exerciseName.toLowerCase() === ex.toLowerCase())
  );

  const addExercise = (exerciseName: string) => {
    if (!exerciseName.trim()) return;

    const newExercise: RoutineExercise = {
      id: crypto.randomUUID(),
      exerciseId: crypto.randomUUID(),
      exerciseName: exerciseName.trim(),
      sets: 3,
      defaultWeight: 0,
      defaultReps: 10,
    };

    setExercises((prev) => [...prev, newExercise]);
    setNewExerciseName('');
    setShowSuggestions(false);
  };

  const removeExercise = (id: string) => {
    setExercises((prev) => prev.filter((e) => e.id !== id));
  };

  const updateExercise = (id: string, updates: Partial<RoutineExercise>) => {
    setExercises((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  };

  const handleSave = () => {
    if (!routine || !name.trim()) return;

    const updatedRoutine: Routine = {
      ...routine,
      name: name.trim(),
      exercises,
      updatedAt: new Date().toISOString(),
    };

    onSave(updatedRoutine);
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setExercises([]);
    setNewExerciseName('');
    onClose();
  };

  return (
    <Sheet open={!!routine} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl">
        <SheetHeader className="text-left pb-4">
          <SheetTitle>Edit Routine</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 overflow-auto max-h-[calc(90vh-180px)] pb-4">
          <div className="space-y-2">
            <Label htmlFor="edit-routine-name">Routine Name</Label>
            <Input
              id="edit-routine-name"
              placeholder="e.g., Push Day, Leg Day..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <Label>Exercises</Label>

            {exercises.map((exercise) => (
              <Card key={exercise.id} className="p-3">
                <div className="flex items-center gap-2 mb-3">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <span className="flex-1 font-medium">{exercise.exerciseName}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => removeExercise(exercise.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Sets</Label>
                    <Input
                      type="number"
                      min="1"
                      value={exercise.sets}
                      onChange={(e) =>
                        updateExercise(exercise.id, { sets: parseInt(e.target.value) || 1 })
                      }
                      className="h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Weight (kg)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      value={exercise.defaultWeight}
                      onChange={(e) =>
                        updateExercise(exercise.id, { defaultWeight: parseFloat(e.target.value) || 0 })
                      }
                      className="h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Reps</Label>
                    <Input
                      type="number"
                      min="1"
                      value={exercise.defaultReps}
                      onChange={(e) =>
                        updateExercise(exercise.id, { defaultReps: parseInt(e.target.value) || 1 })
                      }
                      className="h-9"
                    />
                  </div>
                </div>
              </Card>
            ))}

            <div className="relative">
              <Input
                placeholder="Add exercise..."
                value={newExerciseName}
                onChange={(e) => {
                  setNewExerciseName(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addExercise(newExerciseName);
                  }
                }}
              />

              {showSuggestions && newExerciseName && filteredSuggestions.length > 0 && (
                <Card className="absolute z-10 w-full mt-1 max-h-48 overflow-auto">
                  {filteredSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-secondary transition-colors"
                      onClick={() => addExercise(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </Card>
              )}
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => addExercise(newExerciseName)}
              disabled={!newExerciseName.trim()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Exercise
            </Button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-background safe-bottom">
          <Button
            className="w-full gradient-primary"
            onClick={handleSave}
            disabled={!name.trim() || exercises.length === 0}
          >
            Save Changes
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
