
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronDown, ChevronUp, Dumbbell, Clock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkoutData {
  title: string;
  progress: number;
  completedExercises: number;
  totalExercises: number;
  timeSpent: string;
  isCompleted: boolean;
}

interface DailyWorkoutSummaryCardProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
  workoutData?: WorkoutData;
  onContinueWorkout?: () => void;
  onViewSummary?: () => void;
}

export function DailyWorkoutSummaryCard({ 
  isCollapsed = false, 
  onToggleCollapse,
  className,
  workoutData,
  onContinueWorkout,
  onViewSummary
}: DailyWorkoutSummaryCardProps) {
  const [localCollapsed, setLocalCollapsed] = useState(isCollapsed);
  
  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setLocalCollapsed(!localCollapsed);
    }
  };
  
  const collapsed = onToggleCollapse ? isCollapsed : localCollapsed;

  if (!workoutData) {
    return (
      <Card className={cn("transition-all duration-300", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-hashim-100 rounded-lg">
                <Dumbbell className="h-4 w-4 text-hashim-600" />
              </div>
              <CardTitle className="text-lg">Today's Workout</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Dumbbell size={48} className="mx-auto mb-4 opacity-20" />
            <p>No workout scheduled for today</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("transition-all duration-300", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-hashim-100 rounded-lg">
              <Dumbbell className="h-4 w-4 text-hashim-600" />
            </div>
            <CardTitle className="text-lg">Today's Workout</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggle}
            className="h-8 w-8 p-0"
          >
            {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {!collapsed && (
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-base">{workoutData.title}</h3>
            {workoutData.isCompleted && (
              <div className="flex items-center space-x-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Complete</span>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{workoutData.completedExercises}/{workoutData.totalExercises} exercises</span>
            </div>
            <Progress value={workoutData.progress} className="h-2" />
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-sm">{workoutData.timeSpent}</span>
            </div>
            <Button 
              size="sm" 
              className="bg-hashim-600 hover:bg-hashim-700"
              onClick={workoutData.isCompleted ? onViewSummary : onContinueWorkout}
            >
              {workoutData.isCompleted ? "View Summary" : "Continue Workout"}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
