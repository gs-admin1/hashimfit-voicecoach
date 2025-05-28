
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  Clock, 
  Target, 
  CheckCircle2, 
  Star,
  MoreHorizontal,
  Zap,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkoutCardImprovedProps {
  workout: {
    id: string;
    title: string;
    exercises: any[];
    category: string;
    estimatedDuration?: number;
    targetMuscles?: string[];
    isCompleted?: boolean;
    streak?: number;
    difficulty?: number;
    aiGenerated?: boolean;
    isFavorite?: boolean;
  };
  onStart: (workout: any) => void;
  onEdit?: (workout: any) => void;
  className?: string;
}

export function WorkoutCardImproved({ 
  workout, 
  onStart, 
  onEdit,
  className 
}: WorkoutCardImprovedProps) {
  const [isFavorite, setIsFavorite] = useState(workout.isFavorite || false);
  
  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return "text-green-600 bg-green-100";
    if (difficulty <= 4) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };
  
  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty <= 2) return "Beginner";
    if (difficulty <= 4) return "Intermediate";
    return "Advanced";
  };
  
  return (
    <Card className={cn(
      "transition-all duration-300 hover:shadow-lg border-l-4",
      workout.isCompleted 
        ? "border-l-green-500 bg-green-50/30" 
        : "border-l-hashim-500",
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-lg">{workout.title}</h3>
              {workout.aiGenerated && (
                <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                  <Zap size={10} className="mr-1" />
                  AI
                </Badge>
              )}
              {workout.streak && workout.streak > 0 && (
                <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                  🔥 {workout.streak}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-3 text-sm text-muted-foreground mb-2">
              {workout.estimatedDuration && (
                <div className="flex items-center">
                  <Clock size={14} className="mr-1" />
                  {workout.estimatedDuration}min
                </div>
              )}
              <div className="flex items-center">
                <Target size={14} className="mr-1" />
                {workout.exercises.length} exercises
              </div>
              {workout.difficulty && (
                <Badge 
                  variant="outline" 
                  className={cn("text-xs", getDifficultyColor(workout.difficulty))}
                >
                  {getDifficultyLabel(workout.difficulty)}
                </Badge>
              )}
            </div>
            
            {workout.targetMuscles && workout.targetMuscles.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {workout.targetMuscles.slice(0, 3).map((muscle, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="text-xs bg-gray-50"
                  >
                    {muscle}
                  </Badge>
                ))}
                {workout.targetMuscles.length > 3 && (
                  <Badge variant="outline" className="text-xs bg-gray-50">
                    +{workout.targetMuscles.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Star 
                size={16} 
                className={cn(
                  isFavorite ? "text-yellow-500 fill-current" : "text-gray-400"
                )}
              />
            </button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal size={16} />
            </Button>
          </div>
        </div>
        
        {workout.isCompleted ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center text-green-600">
              <CheckCircle2 size={16} className="mr-2" />
              <span className="text-sm font-medium">Completed</span>
              <TrendingUp size={14} className="ml-2 text-green-500" />
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onStart(workout)}
              className="text-green-600 border-green-200 hover:bg-green-50"
            >
              View Results
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">0/{workout.exercises.length}</span>
            </div>
            <Progress value={0} className="h-2" />
            
            <Button 
              onClick={() => onStart(workout)}
              className="w-full bg-hashim-600 hover:bg-hashim-700 text-white"
              size="lg"
            >
              <Play size={16} className="mr-2" />
              Start Workout
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
