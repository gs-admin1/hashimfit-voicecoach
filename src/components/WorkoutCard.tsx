
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { WorkoutResultsModal } from "@/components/WorkoutResultsModal";
import { 
  Play, 
  CheckCircle, 
  Clock, 
  Target, 
  ChevronRight, 
  MoreHorizontal,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkoutCardProps {
  workout: {
    id: string;
    title: string;
    exercises: Array<{
      id: string;
      name: string;
      sets: number;
      reps: string;
      weight: string;
      completed: boolean;
      source?: 'planned' | 'voice';
    }>;
    category: string;
    isFavorite: boolean;
    estimatedDuration: number;
    targetMuscles: string[];
    difficulty: number;
    aiGenerated: boolean;
    isCompleted: boolean;
    streak?: number;
    workout_log_id?: string;
    scheduledDate?: string;
    completionDate?: string;
  };
  onStart: (workout: any) => void;
  onAskCoach: () => void;
  onReplaceWorkout: () => void;
  onUpdateWorkout?: (workout: any, applyToAll?: boolean) => void;
}

export function WorkoutCard({ 
  workout, 
  onStart, 
  onAskCoach, 
  onReplaceWorkout,
  onUpdateWorkout 
}: WorkoutCardProps) {
  const [showResults, setShowResults] = useState(false);
  
  const completedExercises = workout.exercises.filter(ex => ex.completed).length;
  const totalExercises = workout.exercises.length;
  const completionPercentage = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return "bg-green-100 text-green-700";
    if (difficulty <= 3) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  const getCategoryEmoji = (category: string) => {
    const emojiMap: Record<string, string> = {
      strength: "💪",
      cardio: "🏃",
      hiit: "⚡",
      recovery: "🧘",
      sport_specific: "⚽",
      custom: "🎯"
    };
    return emojiMap[category] || "🏋️";
  };

  const handleViewResults = () => {
    setShowResults(true);
  };

  const handleRepeatWorkout = () => {
    onStart(workout);
  };

  const handleCustomizePlan = () => {
    // This would open the workout customization modal
    console.log("Customize plan for workout:", workout.id);
  };

  const handleViewHistory = () => {
    // This would navigate to the workout history page
    console.log("View history for workout:", workout.id);
  };

  return (
    <>
      <Card className={cn(
        "overflow-hidden transition-all duration-200 hover:shadow-lg",
        workout.isCompleted && "border-green-200 bg-green-50/30"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">{getCategoryEmoji(workout.category)}</span>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {workout.title}
                </CardTitle>
                {workout.isCompleted && (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="outline" className={getDifficultyColor(workout.difficulty)}>
                  Level {workout.difficulty}
                </Badge>
                {workout.aiGenerated && (
                  <Badge variant="outline" className="bg-purple-100 text-purple-700">
                    AI Generated
                  </Badge>
                )}
                {workout.streak && workout.streak > 1 && (
                  <Badge variant="outline" className="bg-orange-100 text-orange-700">
                    🔥 {workout.streak} streak
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{workout.estimatedDuration}m</span>
              </div>
              <div className="flex items-center space-x-1">
                <Target className="h-4 w-4" />
                <span>{totalExercises} exercises</span>
              </div>
            </div>
          </div>

          {workout.isCompleted ? (
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span className="font-medium">{completedExercises}/{totalExercises} completed</span>
                </div>
                <Progress value={completionPercentage} className="h-2" />
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={handleViewResults}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Results
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRepeatWorkout}
                >
                  <Play className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex space-x-2">
              <Button 
                className="flex-1 bg-hashim-600 hover:bg-hashim-700"
                onClick={() => onStart(workout)}
              >
                <Play className="h-4 w-4 mr-2" />
                Start Workout
              </Button>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="flex flex-wrap gap-1">
            {workout.targetMuscles.slice(0, 3).map((muscle, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {muscle}
              </Badge>
            ))}
            {workout.targetMuscles.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{workout.targetMuscles.length - 3} more
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <WorkoutResultsModal
        isOpen={showResults}
        onClose={() => setShowResults(false)}
        workout={{
          ...workout,
          actualDuration: workout.estimatedDuration, // This would come from workout logs
          caloriesBurned: Math.round(workout.estimatedDuration * 5), // Rough estimate
          intensityLevel: workout.difficulty,
          aiModifications: workout.aiGenerated
        }}
        onRepeatWorkout={handleRepeatWorkout}
        onCustomizePlan={handleCustomizePlan}
        onViewHistory={handleViewHistory}
        onAskCoach={onAskCoach}
      />
    </>
  );
}
