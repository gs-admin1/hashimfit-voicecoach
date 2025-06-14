
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus, Target, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeeklyMomentumCardProps {
  momentum: 'up' | 'steady' | 'down';
  weeklyProgress: number;
  isJustStarting: boolean;
  stats: {
    workoutCompletion: number;
    nutritionCompliance: number;
    habitsCompleted: number;
    totalHabits: number;
    progressTrend: string;
    weeklyGoals: {
      workouts: { completed: number; target: number };
      calories: { avg: number; target: number };
      protein: { avg: number; target: number };
    };
  };
  className?: string;
}

export function WeeklyMomentumCard({ 
  momentum, 
  weeklyProgress, 
  isJustStarting, 
  stats, 
  className 
}: WeeklyMomentumCardProps) {
  const getMomentumIcon = () => {
    switch (momentum) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getMomentumColor = () => {
    switch (momentum) {
      case 'up': return 'border-l-green-500';
      case 'down': return 'border-l-red-500';
      default: return 'border-l-yellow-500';
    }
  };

  const getMomentumBg = () => {
    switch (momentum) {
      case 'up': return 'bg-green-50';
      case 'down': return 'bg-red-50';
      default: return 'bg-yellow-50';
    }
  };

  return (
    <Card className={cn("border-l-4", getMomentumColor(), className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-hashim-600" />
            <CardTitle className="text-lg">Weekly Summary</CardTitle>
          </div>
          <div className="flex items-center space-x-1">
            {getMomentumIcon()}
            <Badge variant="secondary" className="text-xs capitalize">
              {momentum} Trend
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isJustStarting ? (
          <div className={cn("p-3 rounded-lg border", getMomentumBg())}>
            <h4 className="text-sm font-medium mb-1">🌱 Just getting started?</h4>
            <p className="text-xs text-muted-foreground">
              Let's build your baseline this week. Every workout and meal logged helps!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-hashim-50 rounded-lg">
                <p className="text-2xl font-bold text-hashim-700">{stats.workoutCompletion}%</p>
                <p className="text-xs text-muted-foreground">Workouts</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-700">{stats.nutritionCompliance}%</p>
                <p className="text-xs text-muted-foreground">Nutrition</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Weekly Progress</span>
                <span className="font-medium">{weeklyProgress}%</span>
              </div>
              <Progress value={weeklyProgress} className="h-2" />
            </div>
          </div>
        )}

        {/* Goals Progress */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center">
            <Target className="h-4 w-4 mr-1" />
            This Week's Goals
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span>Workouts: {stats.weeklyGoals.workouts.completed}/{stats.weeklyGoals.workouts.target}</span>
              <Progress 
                value={(stats.weeklyGoals.workouts.completed / stats.weeklyGoals.workouts.target) * 100} 
                className="w-16 h-1.5" 
              />
            </div>
            <div className="flex justify-between items-center">
              <span>Avg Calories: {stats.weeklyGoals.calories.avg}/{stats.weeklyGoals.calories.target}</span>
              <Progress 
                value={(stats.weeklyGoals.calories.avg / stats.weeklyGoals.calories.target) * 100} 
                className="w-16 h-1.5" 
              />
            </div>
            <div className="flex justify-between items-center">
              <span>Avg Protein: {stats.weeklyGoals.protein.avg}g/{stats.weeklyGoals.protein.target}g</span>
              <Progress 
                value={(stats.weeklyGoals.protein.avg / stats.weeklyGoals.protein.target) * 100} 
                className="w-16 h-1.5" 
              />
            </div>
          </div>
        </div>

        {/* Habits */}
        <div className="flex justify-between items-center p-2 bg-purple-50 rounded-lg">
          <span className="text-sm">Daily Habits</span>
          <span className="text-sm font-bold text-purple-700">
            {stats.habitsCompleted}/{stats.totalHabits} this week
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
