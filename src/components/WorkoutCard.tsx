import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AnimatedCard } from "@/components/ui-components";
import { WorkoutEditModal } from "@/components/WorkoutEditModal";
import { WorkoutResultsModal } from "@/components/WorkoutResultsModal";
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
  Flame,
  Star,
  Edit,
  MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  category?: string;
  estimatedDuration?: number;
  targetMuscles?: string[];
  difficulty?: number;
  aiGenerated?: boolean;
  streak?: number;
  isFavorite?: boolean;
  isCompleted?: boolean;
}

interface WorkoutCardProps {
  workout: Workout;
  onStart?: (workout: Workout) => void;
  onEdit?: (workout: Workout) => void;
  onAskCoach?: () => void;
  onReplaceWorkout?: () => void;
  onUpdateWorkout?: (workout: Workout, applyToAll: boolean) => void;
}

export function WorkoutCard({ 
  workout, 
  onStart,
  onEdit,
  onAskCoach,
  onReplaceWorkout,
  onUpdateWorkout 
}: WorkoutCardProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);

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

  const handleViewResults = () => {
    setShowResultsModal(true);
  };

  const handleRepeatWorkout = () => {
    setShowResultsModal(false);
    onStart?.(workout);
  };

  const handleAskCoachFromResults = () => {
    setShowResultsModal(false);
    onAskCoach?.();
  };

  // Transform workout data for the results modal
  const getWorkoutResultsData = () => {
    if (!workout.isCompleted) return null;
    
    return {
      id: workout.id,
      title: workout.title,
      exercises: workout.exercises.map(ex => ({
        ...ex,
        actualSets: ex.sets,
        actualReps: ex.reps,
        actualWeight: ex.weight
      })),
      duration: workout.estimatedDuration || 45,
      completedDate: new Date().toISOString(), // Use actual completion date when available
      caloriesBurned: Math.round((workout.estimatedDuration || 45) * 5), // Rough estimation
      rating: 4, // Default rating, should come from actual data
      aiModifications: workout.aiGenerated,
      streak: workout.streak
    };
  };

  return (
    <>
      <AnimatedCard className={cn(
        "w-full transition-all duration-300 hover:shadow-lg border-l-4",
        workout.isCompleted 
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
                  <span>{workout.exercises.length} exercises</span>
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

            <div className="flex items-center gap-2 ml-4">
              {workout.isFavorite && (
                <Star size={20} className="text-yellow-500 fill-current" />
              )}
              {workout.isCompleted && (
                <div className="flex items-center text-green-600">
                  <CheckCircle size={20} />
                  <TrendingUp size={16} className="ml-1" />
                </div>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowEditModal(true)}
              >
                <Edit size={16} />
                <span className="sr-only">Edit</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-4">
          {/* Progress Section */}
          {!workout.isCompleted && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">Progress</span>
                <span className="font-semibold">
                  {completedExercises}/{workout.exercises.length}
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
            {workout.isCompleted ? (
              <Button 
                variant="outline" 
                size="lg"
                onClick={handleViewResults}
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
      </AnimatedCard>

      {/* Edit Workout Modal */}
      <WorkoutEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        workout={workout}
        onSave={(updatedWorkout, applyToAll) => {
          onUpdateWorkout?.(updatedWorkout, applyToAll);
          setShowEditModal(false);
        }}
      />

      {/* Results Modal */}
      <WorkoutResultsModal
        isOpen={showResultsModal}
        onClose={() => setShowResultsModal(false)}
        workoutData={getWorkoutResultsData()}
        onRepeatWorkout={handleRepeatWorkout}
        onAskCoach={handleAskCoachFromResults}
        onCustomizePlan={() => {
          setShowResultsModal(false);
          // Handle customize plan action
        }}
        onViewHistory={() => {
          setShowResultsModal(false);
          // Handle view history action
        }}
      />
    </>
  );
}
