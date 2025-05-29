
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, Clock, Dumbbell } from "lucide-react";
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
}

interface WorkoutCardProps {
  workout: Workout;
  onExerciseComplete?: (exerciseId: string, completed: boolean) => void;
  isSessionMode?: boolean;
}

export function WorkoutCard({ workout, onExerciseComplete, isSessionMode = false }: WorkoutCardProps) {
  // If in session mode, use the enhanced session card
  if (isSessionMode) {
    const sessionWorkout = {
      id: workout.id,
      title: workout.title,
      exercises: workout.exercises.map(ex => ({
        ...ex,
        completed: ex.completed ? 1 : 0,
        rest_seconds: 60,
        position_in_workout: 0
      })),
      category: 'strength',
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

  // Default workout card for dashboard view
  const completedExercises = workout.exercises.filter(ex => ex.completed).length;
  const totalExercises = workout.exercises.length;
  const progress = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-hashim-100 rounded-lg">
              <Dumbbell className="h-4 w-4 text-hashim-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{workout.title}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant={workout.is_completed ? "default" : "secondary"}>
                  {workout.is_completed ? "Completed" : "In Progress"}
                </Badge>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  {totalExercises} exercises
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {!workout.is_completed && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{completedExercises}/{totalExercises} exercises</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-hashim-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3">
        {workout.exercises.map((exercise, index) => (
          <div
            key={exercise.id}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg border transition-all",
              exercise.completed ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200",
              exercise.source === 'voice' && "border-l-4 border-l-blue-400"
            )}
          >
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onExerciseComplete?.(exercise.id, !exercise.completed)}
                className="h-8 w-8 p-0"
              >
                {exercise.completed ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400" />
                )}
              </Button>
              <div>
                <div className="flex items-center space-x-2">
                  <p className={cn(
                    "font-medium",
                    exercise.completed && "line-through text-muted-foreground"
                  )}>
                    {exercise.name}
                  </p>
                  {exercise.source === 'voice' && (
                    <Badge variant="outline" className="text-xs bg-blue-100">
                      Voice logged
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {exercise.sets} sets × {exercise.reps} reps
                  {exercise.weight && exercise.weight !== 'bodyweight' && ` @ ${exercise.weight}`}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {workout.exercises.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Dumbbell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No exercises in this workout</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
