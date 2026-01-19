import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { LogPage } from "@/pages/LogPage";
import { RoutinesPage } from "@/pages/RoutinesPage";
import { StatisticsPage } from "@/pages/StatisticsPage";
import { ActiveWorkoutSheet } from "@/components/workout/ActiveWorkoutSheet";
import { useRoutines, useWorkoutLogs, useActiveWorkout } from "@/hooks/useWorkoutStore";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const { routines, addRoutine, updateRoutine, deleteRoutine } = useRoutines();
  const { logs, addLog, deleteLog, getLastWorkoutForRoutine } = useWorkoutLogs();
  const {
    activeWorkout,
    startWorkout,
    updateExerciseSet,
    addSetToExercise,
    removeSetFromExercise,
    finishWorkout,
    cancelWorkout,
  } = useActiveWorkout();

  return (
    <>
      <MobileLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/log" replace />} />
          <Route
            path="/log"
            element={<LogPage logs={logs} onDeleteLog={deleteLog} />}
          />
          <Route
            path="/routines"
            element={
              <RoutinesPage
                routines={routines}
                onAddRoutine={addRoutine}
                onUpdateRoutine={updateRoutine}
                onDeleteRoutine={deleteRoutine}
                onStartWorkout={startWorkout}
                getLastWorkoutForRoutine={getLastWorkoutForRoutine}
              />
            }
          />
          <Route
            path="/statistics"
            element={<StatisticsPage logs={logs} />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MobileLayout>

      <ActiveWorkoutSheet
        workout={activeWorkout}
        onUpdateSet={updateExerciseSet}
        onAddSet={addSetToExercise}
        onRemoveSet={removeSetFromExercise}
        onFinish={finishWorkout}
        onCancel={cancelWorkout}
        onLogSaved={addLog}
      />
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
