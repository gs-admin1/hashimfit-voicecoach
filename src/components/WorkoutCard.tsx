import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  Dumbbell, 
  Play, 
  ChevronDown, 
  ChevronUp,
  MessageCircle,
  Zap,
  Target,
  TrendingUp,
  Flame
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EnhancedWorkoutSessionCard } from "./EnhancedWorkoutSessionCard";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight: string;
  completed?: boolean;
  source?: 'planned' | 'voice';
}

interface Workout {
  id: string;
  title: string;
  exercises: Exercise[];
  is_completed?: boolean;
  schedule_id?: string;
  workout_log_id?: string;
  category?: string;
  estimatedDuration?: number;
  targetMuscles?: string[];
  difficulty?: number;
  aiGenerated?: boolean;
  streak?: number;
}

interface WorkoutCardProps {
  workout: Workout;
  onExerciseComplete?: (exerciseId: string, completed: boolean) => void;
  isSessionMode?: boolean;
  onStart?: (workout: Workout) => void;
  onAskCoach?: () => void;
  onReplaceWorkout?: () => void;
}

export function WorkoutCard({ 
  workout, 
  onExerciseComplete, 
  isSessionMode = false,
  onStart,
  onAskCoach,
  onReplaceWorkout 
}: WorkoutCardProps) {
  const [showFullExercises, setShowFullExercises] = useState(false);

  // If in session mode, use the enhanced session card
  if (isSessionMode) {
    const sessionWorkout = {
      id: workout.id,
      title: workout.title,
      exercises: workout.exercises.map((ex, index) => ({
        ...ex,
        completed: ex.completed ? 1 : 0,
        rest_seconds: 60,
        position_in_workout: index,
        originalData: {
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
          rest_seconds: 60
        }
      })),
      category: workout.category || 'strength',
      workout_log_id: workout.workout_log_id
    };

    return (
      <EnhancedWorkoutSessionCard 
        workout={sessionWorkout}
        onComplete={() => {}}
        onSaveAsFavorite={() => {}}
        onStartRestTimer={() => {}}
      />
    );
  }

  // Calculate progress
  const completedExercises = workout.exercises.filter(ex => ex.completed).length;
  const totalExercises = workout.exercises.length;
  const progress = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

  // Get difficulty info
  const getDifficultyInfo = (difficulty?: number) => {
    if (!difficulty) return { label: "Intermediate", color: "bg-yellow-100 text-yellow-700" };
    if (difficulty <= 2) return { label: "Beginner", color: "bg-green-100 text-green-700" };
    if (difficulty <= 4) return { label: "Intermediate", color: "bg-yellow-100 text-yellow-700" };
    return { label: "Advanced", color: "bg-red-100 text-red-700" };
  };

  const difficultyInfo = getDifficultyInfo(workout.difficulty);

  // Get workout type from target muscles
  const getWorkoutType = () => {
    if (!workout.targetMuscles || workout.targetMuscles.length === 0) return "Full Body";
    if (workout.targetMuscles.length > 3) return "Full Body";
    return workout.targetMuscles.join(" & ");
  };

  return (
    <Card className={cn(
      "w-full transition-all duration-300 hover:shadow-lg border-l-4",
      workout.is_completed 
        ? "border-l-green-500 bg-green-50/30" 
        : "border-l-hashim-500"
    )}>
      {/* Top Section - Overview */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold text-foreground">{workout.title}</h3>
              <div className="flex items-center gap-1">
                {workout.aiGenerated && (
                  <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 px-2 py-1">
                    <Zap size={10} className="mr-1" />
                    AI
                  </Badge>
                )}
                {workout.streak && workout.streak > 0 && (
                  <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 px-2 py-1">
                    <Flame size={10} className="mr-1" />
                    {workout.streak}
                  </Badge>
                )}
              </div>
            </div>

            {/* Metadata Row */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
              {workout.estimatedDuration && (
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{workout.estimatedDuration} min</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Target size={14} />
                <span>{totalExercises} exercises</span>
              </div>
            </div>

            {/* Tags Row */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={cn("text-xs px-2 py-1", difficultyInfo.color)}>
                {difficultyInfo.label}
              </Badge>
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 px-2 py-1">
                {getWorkoutType()}
              </Badge>
            </div>
          </div>

          {workout.is_completed && (
            <div className="flex items-center text-green-600 ml-4">
              <CheckCircle size={20} />
              <TrendingUp size={16} className="ml-1" />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Middle Section - Exercise Preview */}
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-muted-foreground">Workout Preview</h4>
            {totalExercises > 3 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullExercises(!showFullExercises)}
                className="h-6 px-2 text-xs"
              >
                {showFullExercises ? (
                  <>
                    <ChevronUp size={12} className="mr-1" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown size={12} className="mr-1" />
                    Show All
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {workout.exercises
              .slice(0, showFullExercises ? undefined : 3)
              .map((exercise, index) => (
                <div
                  key={exercise.id}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-md transition-colors",
                    exercise.completed 
                      ? "bg-green-50 text-green-800" 
                      : "bg-background/50"
                  )}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <div className="flex-shrink-0">
                      {exercise.completed ? (
                        <CheckCircle size={16} className="text-green-600" />
                      ) : (
                        <Circle size={16} className="text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn(
                          "text-sm font-medium truncate",
                          exercise.completed && "line-through"
                        )}>
                          {exercise.name}
                        </p>
                        {exercise.source === 'voice' && (
                          <Badge variant="outline" className="text-xs bg-blue-100">
                            Voice
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {exercise.sets} × {exercise.reps}
                        {exercise.weight && exercise.weight !== 'bodyweight' && 
                          ` @ ${exercise.weight}`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              ))}

            {!showFullExercises && totalExercises > 3 && (
              <div className="text-center py-2">
                <span className="text-xs text-muted-foreground">
                  +{totalExercises - 3} more exercises
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Section */}
        {!workout.is_completed && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-medium">Progress</span>
              <span className="font-semibold">
                {completedExercises}/{totalExercises} completed
              </span>
            </div>
            <Progress 
              value={progress} 
              className="h-2"
            />
          </div>
        )}

        {/* Bottom CTA Section */}
        <div className="space-y-2 pt-2">
          {workout.is_completed ? (
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => onStart?.(workout)}
              className="w-full text-green-600 border-green-200 hover:bg-green-50"
            >
              <TrendingUp size={16} className="mr-2" />
              View Results
            </Button>
          ) : (
            <Button 
              onClick={() => onStart?.(workout)}
              className="w-full bg-hashim-600 hover:bg-hashim-700 text-white"
              size="lg"
            >
              <Play size={16} className="mr-2" />
              Start Workout
            </Button>
          )}

          {/* Secondary CTAs */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onAskCoach}
              className="flex-1 text-muted-foreground hover:text-foreground"
            >
              <MessageCircle size={14} className="mr-1" />
              Ask Coach
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onReplaceWorkout}
              className="flex-1 text-muted-foreground hover:text-foreground"
            >
              <Dumbbell size={14} className="mr-1" />
              Replace
            </Button>
          </div>
        </div>

        {/* Empty State */}
        {workout.exercises.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Dumbbell className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No exercises in this workout</p>
            <p className="text-xs mt-1">Add exercises to get started</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
