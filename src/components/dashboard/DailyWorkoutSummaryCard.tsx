
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronDown, ChevronUp, Dumbbell, Clock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DailyWorkoutSummaryCardProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

export function DailyWorkoutSummaryCard({ 
  isCollapsed = false, 
  onToggleCollapse,
  className 
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
  
  // Mock data - in real app this would come from props or context
  const workoutData = {
    title: "Upper Body Strength",
    progress: 75,
    completedExercises: 6,
    totalExercises: 8,
    timeSpent: "32 min",
    isCompleted: false
  };

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
            <Button size="sm" className="bg-hashim-600 hover:bg-hashim-700">
              {workoutData.isCompleted ? "View Summary" : "Continue Workout"}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
