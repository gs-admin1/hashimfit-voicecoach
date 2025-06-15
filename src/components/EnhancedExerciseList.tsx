
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, RotateCcw, Info, Dumbbell, Users, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight: string;
  completed?: boolean;
  source?: 'planned' | 'voice';
}

interface EnhancedExerciseListProps {
  exercises: Exercise[];
  onExerciseToggle?: (exerciseId: string) => void;
  className?: string;
}

export function EnhancedExerciseList({ 
  exercises, 
  onExerciseToggle,
  className 
}: EnhancedExerciseListProps) {
  const [swipedExercise, setSwipedExercise] = useState<string | null>(null);

  const handleExerciseClick = (exerciseId: string) => {
    onExerciseToggle?.(exerciseId);
  };

  const handleSwapExercise = (exerciseId: string) => {
    console.log('Swap exercise:', exerciseId);
    // TODO: Implement exercise swap functionality
  };

  const handleFormGuide = (exerciseName: string) => {
    console.log('Show form guide for:', exerciseName);
    // TODO: Implement form guide modal
  };

  // Helper function to determine muscle group from exercise name
  const getMuscleGroup = (exerciseName: string): string => {
    const name = exerciseName.toLowerCase();
    if (name.includes('push') || name.includes('chest') || name.includes('bench')) return 'Chest';
    if (name.includes('pull') || name.includes('row') || name.includes('lat')) return 'Back';
    if (name.includes('squat') || name.includes('lunge') || name.includes('leg')) return 'Legs';
    if (name.includes('shoulder') || name.includes('press') || name.includes('raise')) return 'Shoulders';
    if (name.includes('curl') || name.includes('tricep') || name.includes('arm')) return 'Arms';
    if (name.includes('plank') || name.includes('crunch') || name.includes('core')) return 'Core';
    return 'Full Body';
  };

  // Helper function to get muscle group color
  const getMuscleGroupColor = (group: string): string => {
    switch (group) {
      case 'Chest': return 'bg-red-100 text-red-700';
      case 'Back': return 'bg-blue-100 text-blue-700';
      case 'Legs': return 'bg-green-100 text-green-700';
      case 'Shoulders': return 'bg-orange-100 text-orange-700';
      case 'Arms': return 'bg-purple-100 text-purple-700';
      case 'Core': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Helper function to get equipment icon
  const getEquipmentIcon = (weight: string) => {
    if (weight === 'bodyweight') return <Users size={16} className="text-violet-600" />;
    if (weight.toLowerCase().includes('kg') || weight.toLowerCase().includes('lb')) return <Dumbbell size={16} className="text-violet-600" />;
    return <Zap size={16} className="text-violet-600" />;
  };

  // Helper function to get difficulty bar color
  const getDifficultyColor = (index: number): string => {
    const colors = ['bg-green-400', 'bg-yellow-400', 'bg-orange-400', 'bg-red-400'];
    return colors[Math.min(index % 4, 3)];
  };

  return (
    <TooltipProvider>
      <div className={cn("space-y-4", className)}>
        {exercises.map((exercise, index) => {
          const muscleGroup = getMuscleGroup(exercise.name);
          const isEven = index % 2 === 0;
          
          return (
            <div
              key={exercise.id}
              className={cn(
                "relative rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer overflow-hidden",
                "animate-fade-in",
                exercise.completed 
                  ? "bg-green-50/70 border-green-200 shadow-green-100/50" 
                  : isEven 
                    ? "bg-gradient-to-br from-violet-50/50 to-indigo-50/30 border-violet-200/50 hover:border-violet-300" 
                    : "bg-white/70 border-slate-200/50 hover:border-violet-300",
                "backdrop-blur-sm shadow-lg"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => handleExerciseClick(exercise.id)}
            >
              {/* Difficulty/Category Bar */}
              <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl",
                getDifficultyColor(index)
              )} />

              {/* Main Content */}
              <div className="pl-6 pr-4 py-5">
                {/* Header Row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    {/* Completion Checkbox */}
                    <button
                      className={cn(
                        "w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0",
                        exercise.completed 
                          ? "bg-green-500 border-green-500 text-white scale-110 shadow-lg" 
                          : "border-violet-300 hover:border-violet-500 hover:bg-violet-50"
                      )}
                    >
                      {exercise.completed ? (
                        <CheckCircle size={18} className="animate-scale-in" />
                      ) : (
                        <span className="text-sm font-semibold text-violet-600">
                          {index + 1}
                        </span>
                      )}
                    </button>

                    {/* Muscle Group Tag */}
                    <Badge 
                      className={cn(
                        "text-xs font-medium px-2 py-1 rounded-full",
                        getMuscleGroupColor(muscleGroup)
                      )}
                    >
                      {muscleGroup}
                    </Badge>
                  </div>

                  {/* Voice Badge */}
                  {exercise.source === 'voice' && (
                    <Badge className="text-xs bg-blue-500 text-white rounded-full px-2 py-1">
                      Voice
                    </Badge>
                  )}
                </div>

                {/* Exercise Name - Large and Bold */}
                <h3 className={cn(
                  "text-lg font-bold text-slate-800 dark:text-white mb-3 leading-tight",
                  exercise.completed && "line-through text-slate-500"
                )}>
                  {exercise.name}
                </h3>

                {/* Sets, Reps, Weight Row */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    {/* Sets x Reps */}
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-violet-700">
                        {exercise.sets}
                      </span>
                      <span className="text-sm text-slate-500">×</span>
                      <span className="text-lg font-semibold text-slate-700">
                        {exercise.reps} reps
                      </span>
                    </div>

                    {/* Weight with Icon */}
                    <div className="flex items-center gap-2 px-3 py-1 bg-violet-100/50 rounded-full">
                      {getEquipmentIcon(exercise.weight)}
                      <span className="text-sm font-medium text-violet-700">
                        {exercise.weight === 'bodyweight' ? 'Bodyweight' : exercise.weight}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div className="flex items-center justify-end gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSwapExercise(exercise.id);
                        }}
                        className="h-8 px-3 text-xs text-slate-600 hover:text-violet-700 hover:bg-violet-50 rounded-full"
                      >
                        <RotateCcw size={14} className="mr-1" />
                        Swap
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Replace with alternative exercise</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFormGuide(exercise.name);
                        }}
                        className="h-8 px-3 text-xs text-slate-600 hover:text-violet-700 hover:bg-violet-50 rounded-full"
                      >
                        <Info size={14} className="mr-1" />
                        Form Tips
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View exercise demonstration and tips</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Completion Celebration */}
              {exercise.completed && (
                <div className="absolute top-3 right-3 animate-bounce">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-sm">🎉</span>
                  </div>
                </div>
              )}

              {/* Hover Glow Effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-400/0 via-violet-400/5 to-indigo-400/0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          );
        })}

        {/* Exercise Count Summary */}
        <div className="text-center py-4">
          <p className="text-sm text-slate-500">
            {exercises.filter(ex => ex.completed).length} of {exercises.length} exercises completed
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
}
