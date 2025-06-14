
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Target, Activity, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeeklyStats {
  workoutCompletion: number;
  nutritionCompliance: number;
  habitsCompleted: number;
  totalHabits: number;
  progressTrend: 'up' | 'down' | 'steady';
  weeklyGoals: {
    workouts: { completed: number; target: number };
    calories: { avg: number; target: number };
    protein: { avg: number; target: number };
  };
}

interface WeeklyMomentumCardProps {
  momentum: 'up' | 'steady' | 'down';
  weeklyProgress: number;
  isJustStarting: boolean;
  stats: WeeklyStats;
  className?: string;
}

export function WeeklyMomentumCard({ 
  momentum, 
  weeklyProgress, 
  isJustStarting, 
  stats, 
  className 
}: WeeklyMomentumCardProps) {
  const getMomentumStyle = () => {
    if (isJustStarting) {
      return {
        border: 'border-blue-200',
        background: 'bg-gradient-to-r from-blue-50 to-indigo-50',
        text: 'text-blue-800',
        icon: Target
      };
    }
    
    switch (momentum) {
      case 'up':
        return {
          border: 'border-green-200',
          background: 'bg-gradient-to-r from-green-50 to-emerald-50',
          text: 'text-green-800',
          icon: TrendingUp
        };
      case 'down':
        return {
          border: 'border-red-200',
          background: 'bg-gradient-to-r from-red-50 to-rose-50',
          text: 'text-red-800',
          icon: TrendingDown
        };
      default:
        return {
          border: 'border-gray-200',
          background: 'bg-gradient-to-r from-gray-50 to-slate-50',
          text: 'text-gray-800',
          icon: Minus
        };
    }
  };

  const momentumStyle = getMomentumStyle();
  const MomentumIcon = momentumStyle.icon;

  const getComplianceColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className={cn("border-l-4", momentumStyle.border, className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <span>Weekly Summary</span>
          </CardTitle>
          <Badge className={cn("flex items-center space-x-1", momentumStyle.background, momentumStyle.text)}>
            <MomentumIcon className="h-3 w-3" />
            <span className="text-xs font-medium">
              {isJustStarting ? 'Getting Started' : 
               momentum === 'up' ? 'Improving' : 
               momentum === 'down' ? 'Declining' : 'Steady'}
            </span>
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Contextual Banner */}
        {isJustStarting && (
          <div className={cn("p-3 rounded-lg", momentumStyle.background)}>
            <p className={cn("text-sm font-medium", momentumStyle.text)}>
              💡 Just getting started? Let's build your baseline this week.
            </p>
          </div>
        )}
        
        {/* Weekly Goals Progress Timeline */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Weekly Goals Progress</span>
            <span className="text-muted-foreground">{weeklyProgress}% complete</span>
          </div>
          <Progress value={weeklyProgress} className="h-3" />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Activity className="h-8 w-8 text-hashim-600" />
            </div>
            <p className={cn("text-2xl font-bold", getComplianceColor(stats.workoutCompletion))}>
              {stats.workoutCompletion}%
            </p>
            <p className="text-xs text-muted-foreground">Workouts</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Utensils className="h-8 w-8 text-blue-600" />
            </div>
            <p className={cn("text-2xl font-bold", getComplianceColor(stats.nutritionCompliance))}>
              {stats.nutritionCompliance}%
            </p>
            <p className="text-xs text-muted-foreground">Nutrition</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">
              {stats.habitsCompleted}/{stats.totalHabits}
            </p>
            <p className="text-xs text-muted-foreground">Habits</p>
          </div>
        </div>
        
        {/* Progress Bars */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Workout Completion</span>
              <span>{stats.workoutCompletion}%</span>
            </div>
            <Progress value={stats.workoutCompletion} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Nutrition Compliance</span>
              <span>{stats.nutritionCompliance}%</span>
            </div>
            <Progress value={stats.nutritionCompliance} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Habit Consistency</span>
              <span>{Math.round((stats.habitsCompleted / stats.totalHabits) * 100)}%</span>
            </div>
            <Progress value={(stats.habitsCompleted / stats.totalHabits) * 100} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
