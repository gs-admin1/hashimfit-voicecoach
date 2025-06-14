
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, Play, RotateCcw } from "lucide-react";
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

  return (
    <TooltipProvider>
      <div className={cn("space-y-4", className)}>
        {exercises.map((exercise, index) => (
          <div
            key={exercise.id}
            className={cn(
              "relative p-4 rounded-lg border-2 transition-all duration-300 animate-fade-in",
              "hover:shadow-md cursor-pointer",
              exercise.completed 
                ? "bg-green-50/50 border-green-200/50" 
                : "bg-background border-border hover:border-hashim-300"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => handleExerciseClick(exercise.id)}
          >
            {/* Exercise Row */}
            <div className="flex items-start gap-4">
              {/* Checkbox */}
              <button
                className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 mt-1 flex-shrink-0",
                  exercise.completed 
                    ? "bg-green-500 border-green-500 text-white scale-110" 
                    : "border-gray-300 hover:border-hashim-500 hover:bg-hashim-50"
                )}
              >
                {exercise.completed ? (
                  <CheckCircle size={16} className="animate-scale-in" />
                ) : (
                  <Circle size={16} className="opacity-50" />
                )}
              </button>

              {/* Exercise Details */}
              <div className="flex-1 min-w-0">
                {/* Sets x Reps - Most Prominent */}
                <div className="text-lg font-bold text-hashim-700 mb-1">
                  {exercise.sets} × {exercise.reps} reps
                </div>
                
                {/* Exercise Name - Secondary */}
                <div className={cn(
                  "text-base font-medium mb-2",
                  exercise.completed && "line-through text-muted-foreground"
                )}>
                  {exercise.name}
                </div>
                
                {/* Weight/Equipment - Tertiary */}
                <div className="text-sm text-muted-foreground mb-3">
                  @ {exercise.weight === 'bodyweight' ? 'bodyweight' : exercise.weight}
                  {exercise.source === 'voice' && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      Voice logged
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSwapExercise(exercise.id);
                        }}
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <RotateCcw size={12} className="mr-1" />
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
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <Play size={12} className="mr-1" />
                        🎯 Form Tips
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View exercise demonstration and tips</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>

            {/* Completion Animation */}
            {exercise.completed && (
              <div className="absolute top-2 right-2 animate-bounce">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              </div>
            )}

            {/* Divider Line */}
            {index < exercises.length - 1 && (
              <div className="absolute -bottom-2 left-4 right-4 h-px bg-border/50" />
            )}
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
}
