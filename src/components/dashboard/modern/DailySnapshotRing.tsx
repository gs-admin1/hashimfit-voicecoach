
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface DailySnapshotRingProps {
  progress: {
    calories: { consumed: number; burned: number; target: number };
    protein: { consumed: number; target: number };
    completedWorkouts: number;
    targetWorkouts: number;
  };
  className?: string;
}

export function DailySnapshotRing({ progress, className }: DailySnapshotRingProps) {
  const calorieBalance = progress.calories.consumed - progress.calories.burned;
  const proteinProgress = (progress.protein.consumed / progress.protein.target) * 100;
  const workoutProgress = (progress.completedWorkouts / progress.targetWorkouts) * 100;

  return (
    <Card className={cn("border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center space-x-2">
          <span className="text-2xl">📊</span>
          <span>Today's Snapshot</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Calorie Balance */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold">
              🔥
            </div>
            <div>
              <p className="font-semibold">Calorie Balance</p>
              <p className="text-sm text-muted-foreground">
                {calorieBalance > 0 ? '+' : ''}{calorieBalance} cal
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Consumed</p>
            <p className="font-bold text-lg">{progress.calories.consumed}</p>
          </div>
        </div>

        {/* Protein Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-lg">🥩</span>
              <span className="font-semibold">Protein</span>
            </div>
            <span className="text-sm font-medium">{Math.round(proteinProgress)}%</span>
          </div>
          <Progress value={proteinProgress} className="h-3 bg-gray-200">
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-300 rounded-full"
              style={{ width: `${Math.min(proteinProgress, 100)}%` }}
            />
          </Progress>
          <p className="text-xs text-muted-foreground mt-1">
            {progress.protein.consumed}g / {progress.protein.target}g
          </p>
        </div>

        {/* Workout Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-lg">💪</span>
              <span className="font-semibold">Workouts</span>
            </div>
            <span className="text-sm font-medium">{Math.round(workoutProgress)}%</span>
          </div>
          <Progress value={workoutProgress} className="h-3 bg-gray-200">
            <div 
              className="h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-300 rounded-full"
              style={{ width: `${Math.min(workoutProgress, 100)}%` }}
            />
          </Progress>
          <p className="text-xs text-muted-foreground mt-1">
            {progress.completedWorkouts} / {progress.targetWorkouts} completed
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
