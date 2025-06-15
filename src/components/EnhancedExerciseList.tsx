
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, RotateCcw, Info, Dumbbell, Users, Zap, Heart, ArrowRight } from "lucide-react";
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

  // Helper function to get muscle group color with improved contrast
  const getMuscleGroupColor = (group: string): string => {
    switch (group) {
      case 'Chest': return 'bg-red-200/80 text-red-800 border-red-300';
      case 'Back': return 'bg-blue-200/80 text-blue-800 border-blue-300';
      case 'Legs': return 'bg-green-200/80 text-green-800 border-green-300';
      case 'Shoulders': return 'bg-orange-200/80 text-orange-800 border-orange-300';
      case 'Arms': return 'bg-purple-200/80 text-purple-800 border-purple-300';
      case 'Core': return 'bg-yellow-200/80 text-yellow-800 border-yellow-300';
      default: return 'bg-slate-200/80 text-slate-800 border-slate-300';
    }
  };

  // Helper function to get muscle group icon
  const getMuscleGroupIcon = (group: string) => {
    switch (group) {
      case 'Chest': return '💪';
      case 'Back': return '🔙';
      case 'Legs': return '🦵';
      case 'Shoulders': return '🤲';
      case 'Arms': return '💪';
      case 'Core': return '⚡';
      default: return '🏋️';
    }
  };

  // Helper function to get equipment icon with better styling
  const getEquipmentIcon = (weight: string) => {
    if (weight === 'bodyweight') return <Users size={18} className="text-violet-700" />;
    if (weight.toLowerCase().includes('kg') || weight.toLowerCase().includes('lb')) return <Dumbbell size={18} className="text-violet-700" />;
    return <Zap size={18} className="text-violet-700" />;
  };

  // Helper function to get difficulty bar color with darker tones
  const getDifficultyColor = (index: number): string => {
    const colors = ['bg-green-600', 'bg-yellow-600', 'bg-orange-600', 'bg-red-600'];
    return colors[Math.min(index % 4, 3)];
  };

  return (
    <TooltipProvider>
      <div className={cn("space-y-6", className)}>
        {exercises.map((exercise, index) => {
          const muscleGroup = getMuscleGroup(exercise.name);
          const isEven = index % 2 === 0;
          
          return (
            <div
              key={exercise.id}
              className={cn(
                "relative rounded-2xl border-2 transition-all duration-500 hover:shadow-xl hover:scale-[1.01] cursor-pointer overflow-hidden group",
                "animate-fade-in hover:bg-gradient-to-br hover:from-violet-50/30 hover:to-indigo-50/20",
                exercise.completed 
                  ? "bg-green-50/80 border-green-300/60 shadow-green-200/40" 
                  : isEven 
                    ? "bg-gradient-to-br from-violet-50/60 to-indigo-50/40 border-violet-300/50 hover:border-violet-400" 
                    : "bg-white/80 border-slate-300/50 hover:border-violet-400",
                "backdrop-blur-sm shadow-xl py-6 px-5"
              )}
              style={{ 
                animationDelay: `${index * 150}ms`,
                transform: 'translateZ(0)' // Force hardware acceleration
              }}
              onClick={() => handleExerciseClick(exercise.id)}
            >
              {/* Enhanced Difficulty/Category Bar */}
              <div className={cn(
                "absolute left-0 top-0 bottom-0 w-2 rounded-l-2xl shadow-inner",
                getDifficultyColor(index)
              )} />

              {/* Main Content with increased padding */}
              <div className="pl-6 pr-4">
                {/* Header Row with improved spacing */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Enhanced Completion Checkbox */}
                    <button
                      className={cn(
                        "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-400 flex-shrink-0 shadow-lg",
                        exercise.completed 
                          ? "bg-green-500 border-green-500 text-white scale-110 shadow-green-300/50 animate-pulse" 
                          : "border-violet-400 hover:border-violet-600 hover:bg-violet-100 hover:scale-105"
                      )}
                    >
                      {exercise.completed ? (
                        <CheckCircle size={20} className="animate-bounce" />
                      ) : (
                        <span className="text-sm font-bold text-violet-700">
                          {index + 1}
                        </span>
                      )}
                    </button>

                    {/* Enhanced Muscle Group Tag with icon */}
                    <Badge 
                      className={cn(
                        "text-sm font-bold px-3 py-2 rounded-full border shadow-sm transition-colors duration-300",
                        getMuscleGroupColor(muscleGroup)
                      )}
                    >
                      <span className="mr-1">{getMuscleGroupIcon(muscleGroup)}</span>
                      {muscleGroup}
                    </Badge>
                  </div>

                  {/* Enhanced Voice Badge */}
                  {exercise.source === 'voice' && (
                    <Badge className="text-xs bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full px-3 py-1.5 shadow-md animate-pulse">
                      🎤 Voice
                    </Badge>
                  )}
                </div>

                {/* Exercise Name - Enhanced Typography */}
                <h3 className={cn(
                  "text-xl font-bold text-slate-900 dark:text-white mb-4 leading-tight tracking-tight",
                  exercise.completed && "line-through text-slate-600"
                )}>
                  {exercise.name}
                </h3>

                {/* Sets, Reps, Weight Row with improved spacing */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-6">
                    {/* Enhanced Sets x Reps */}
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-black text-violet-800 bg-violet-100/50 rounded-lg px-2 py-1">
                        {exercise.sets}
                      </span>
                      <span className="text-lg text-slate-400 font-medium">×</span>
                      <span className="text-xl font-bold text-slate-800">
                        {exercise.reps}
                      </span>
                      <span className="text-sm text-slate-500 font-medium">reps</span>
                    </div>

                    {/* Enhanced Weight with Icon */}
                    <div className="flex items-center gap-3 px-4 py-2 bg-violet-100/60 rounded-full border border-violet-200/50 shadow-sm">
                      {getEquipmentIcon(exercise.weight)}
                      <span className="text-sm font-semibold text-violet-800">
                        {exercise.weight === 'bodyweight' ? 'Bodyweight' : exercise.weight}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Enhanced Action Buttons Row */}
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200/50">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSwapExercise(exercise.id);
                        }}
                        className="h-10 px-4 text-xs text-slate-600 hover:text-violet-700 hover:bg-violet-100/80 rounded-full transition-all duration-300 hover:scale-105 shadow-sm border border-transparent hover:border-violet-200"
                      >
                        <RotateCcw size={16} className="mr-2" />
                        Swap
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="font-medium">Replace with alternative exercise</p>
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
                        className="h-10 px-4 text-xs text-slate-600 hover:text-violet-700 hover:bg-violet-100/80 rounded-full transition-all duration-300 hover:scale-105 shadow-sm border border-transparent hover:border-violet-200"
                      >
                        <Info size={16} className="mr-2" />
                        Form Tips
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="font-medium">View exercise demonstration and tips</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Enhanced Completion Celebration */}
              {exercise.completed && (
                <div className="absolute top-4 right-4 animate-bounce">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-xl shadow-green-300/50">
                    <span className="text-white text-lg animate-pulse">🎉</span>
                  </div>
                </div>
              )}

              {/* Enhanced Hover Glow Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-400/0 via-violet-400/10 to-indigo-400/0 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />
              
              {/* Subtle inner glow on hover */}
              <div className="absolute inset-1 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          );
        })}

        {/* Enhanced Exercise Count Summary */}
        <div className="text-center py-6 px-4">
          <div className="inline-flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-violet-200/50">
            <Heart size={16} className="text-violet-600" />
            <p className="text-sm font-semibold text-slate-700">
              <span className="text-violet-700 font-bold">{exercises.filter(ex => ex.completed).length}</span>
              <span className="mx-2">of</span>
              <span className="text-violet-700 font-bold">{exercises.length}</span>
              <span className="ml-2">exercises completed</span>
            </p>
            <ArrowRight size={16} className="text-violet-600" />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
