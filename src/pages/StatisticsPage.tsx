import { useMemo } from 'react';
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns';
import { Clock, Dumbbell, TrendingUp, Repeat, Flame, Calendar } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/card';
import { WorkoutLog } from '@/types/workout';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface StatisticsPageProps {
  logs: WorkoutLog[];
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function StatisticsPage({ logs }: StatisticsPageProps) {
  const stats = useMemo(() => {
    if (logs.length === 0) return null;

    const totalWorkouts = logs.length;
    const totalDuration = logs.reduce((sum, log) => sum + log.duration, 0);
    const totalVolume = logs.reduce((sum, log) => sum + log.totalVolume, 0);
    const totalSets = logs.reduce((sum, log) => sum + log.totalSets, 0);
    const totalReps = logs.reduce((sum, log) => sum + log.totalReps, 0);

    const avgDuration = Math.round(totalDuration / totalWorkouts);
    const avgVolume = Math.round(totalVolume / totalWorkouts);

    // Calculate streak
    const sortedDates = [...new Set(
      logs.map((log) => startOfDay(new Date(log.completedAt)).getTime())
    )].sort((a, b) => b - a);

    let streak = 0;
    const today = startOfDay(new Date()).getTime();
    const yesterday = startOfDay(subDays(new Date(), 1)).getTime();

    if (sortedDates[0] === today || sortedDates[0] === yesterday) {
      streak = 1;
      for (let i = 1; i < sortedDates.length; i++) {
        const diff = sortedDates[i - 1] - sortedDates[i];
        if (diff <= 86400000) {
          streak++;
        } else {
          break;
        }
      }
    }

    return {
      totalWorkouts,
      totalDuration,
      totalVolume,
      totalSets,
      totalReps,
      avgDuration,
      avgVolume,
      streak,
    };
  }, [logs]);

  const chartData = useMemo(() => {
    if (logs.length === 0) return [];

    const last30Days = eachDayOfInterval({
      start: subDays(new Date(), 29),
      end: new Date(),
    });

    return last30Days.map((day) => {
      const dayStart = startOfDay(day).getTime();
      const dayLogs = logs.filter((log) => {
        const logDay = startOfDay(new Date(log.completedAt)).getTime();
        return logDay === dayStart;
      });

      return {
        date: format(day, 'MMM d'),
        shortDate: format(day, 'd'),
        duration: dayLogs.reduce((sum, log) => sum + Math.round(log.duration / 60), 0),
        volume: dayLogs.reduce((sum, log) => sum + log.totalVolume, 0),
        sets: dayLogs.reduce((sum, log) => sum + log.totalSets, 0),
        reps: dayLogs.reduce((sum, log) => sum + log.totalReps, 0),
        workouts: dayLogs.length,
      };
    });
  }, [logs]);

  const exerciseStats = useMemo(() => {
    const exerciseMap = new Map<string, { totalVolume: number; maxWeight: number; totalSets: number }>();

    logs.forEach((log) => {
      log.exercises.forEach((exercise) => {
        const current = exerciseMap.get(exercise.exerciseName) || {
          totalVolume: 0,
          maxWeight: 0,
          totalSets: 0,
        };

        exercise.sets.forEach((set) => {
          if (set.completed) {
            current.totalVolume += set.weight * set.reps;
            current.maxWeight = Math.max(current.maxWeight, set.weight);
            current.totalSets += 1;
          }
        });

        exerciseMap.set(exercise.exerciseName, current);
      });
    });

    return Array.from(exerciseMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.totalVolume - a.totalVolume)
      .slice(0, 5);
  }, [logs]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-2 text-sm shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader title="Statistics" subtitle="Track your progress" />

      <div className="flex-1 p-4 space-y-4 pb-8">
        {!stats ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-1">No data yet</h3>
            <p className="text-muted-foreground text-sm max-w-[240px]">
              Complete some workouts to see your statistics and progress charts
            </p>
          </div>
        ) : (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="p-3 text-center">
                <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                <p className="text-2xl font-bold">{stats.streak}</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </Card>
              <Card className="p-3 text-center">
                <Calendar className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-2xl font-bold">{stats.totalWorkouts}</p>
                <p className="text-xs text-muted-foreground">Workouts</p>
              </Card>
              <Card className="p-3 text-center">
                <Clock className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <p className="text-2xl font-bold">{formatDuration(stats.avgDuration)}</p>
                <p className="text-xs text-muted-foreground">Avg Time</p>
              </Card>
            </div>

            {/* Totals */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{stats.totalVolume.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total Volume (kg)</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{stats.totalSets.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total Sets</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Volume Chart */}
            <Card className="p-4">
              <h3 className="font-semibold mb-1">Volume (Last 30 Days)</h3>
              <p className="text-xs text-muted-foreground mb-4">Total weight × reps per day</p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="shortDate"
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={false}
                      width={40}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="volume"
                      name="Volume (kg)"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="url(#volumeGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Duration Chart */}
            <Card className="p-4">
              <h3 className="font-semibold mb-1">Duration (Last 30 Days)</h3>
              <p className="text-xs text-muted-foreground mb-4">Workout duration in minutes</p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="shortDate"
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={false}
                      width={30}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="duration"
                      name="Duration (min)"
                      fill="hsl(var(--chart-2))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Sets Chart */}
            <Card className="p-4">
              <h3 className="font-semibold mb-1">Sets (Last 30 Days)</h3>
              <p className="text-xs text-muted-foreground mb-4">Completed sets per day</p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="shortDate"
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={false}
                      width={30}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="sets"
                      name="Sets"
                      stroke="hsl(var(--chart-3))"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Reps Chart */}
            <Card className="p-4">
              <h3 className="font-semibold mb-1">Reps (Last 30 Days)</h3>
              <p className="text-xs text-muted-foreground mb-4">Total repetitions per day</p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="repsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="shortDate"
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={false}
                      width={40}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="reps"
                      name="Reps"
                      stroke="hsl(var(--chart-4))"
                      strokeWidth={2}
                      fill="url(#repsGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Top Exercises */}
            {exerciseStats.length > 0 && (
              <Card className="p-4">
                <h3 className="font-semibold mb-1">Top Exercises</h3>
                <p className="text-xs text-muted-foreground mb-4">By total volume</p>
                <div className="space-y-3">
                  {exerciseStats.map((exercise, index) => (
                    <div key={exercise.name} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{exercise.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Max: {exercise.maxWeight}kg · {exercise.totalSets} sets
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-primary">
                        {exercise.totalVolume.toLocaleString()}kg
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
