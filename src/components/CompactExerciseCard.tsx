
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, RotateCcw, Info, CheckCircle, ArrowUpDown } from "lucide-react";
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

interface CompactExerciseCardProps {
  exercise: Exercise;
  exerciseNumber: number;
  isNext?: boolean;
  onToggleComplete: (exerciseId: string) => void;
  onSwap?: (exerciseId: string) => void;
  onFormTips?: (exerciseName: string) => void;
  className?: string;
}

export function CompactExerciseCard({
  exercise,
  exerciseNumber,
  isNext = false,
  onToggleComplete,
  onSwap,
  onFormTips,
  className
}: CompactExerciseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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

  // Helper function to get equipment text
  const getEquipmentText = (weight: string) => {
    if (weight === 'bodyweight') return 'Bodyweight';
    if (weight.toLowerCase().includes('backpack')) return 'Backpack';
    if (weight.toLowerCase().includes('kg') || weight.toLowerCase().includes('lb')) return weight;
    return weight;
  };

  const muscleGroup = getMuscleGroup(exercise.name);

  return (
    <Card className={cn(
      "transition-all duration-300 overflow-hidden",
      "bg-white/90 backdrop-blur-sm border-slate-200 hover:border-violet-300",
      exercise.completed && "border-green-300 bg-green-50/80",
      isNext && "border-violet-400 bg-violet-50/80 ring-2 ring-violet-200/50",
      className
    )}>
      <CardContent className="p-0">
        {/* Compact View */}
        <div
          className="flex items-center p-4 cursor-pointer hover:bg-slate-50/50 transition-colors min-h-[70px]"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {/* Exercise Number Badge */}
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0",
            exercise.completed && "bg-green-500 text-white",
            isNext && "bg-violet-500 text-white",
            !exercise.completed && !isNext && "bg-slate-100 text-slate-600 border-2 border-slate-200"
          )}>
            {exercise.completed ? <CheckCircle size={16} /> : exerciseNumber}
          </div>

          {/* Exercise Info */}
          <div className="flex-1 min-w-0">
            {/* Exercise Name - Bold, max 2 lines */}
            <h3 className={cn(
              "font-bold text-slate-900 leading-tight mb-1 line-clamp-2",
              exercise.completed && "line-through text-slate-600"
            )}>
              {exercise.name}
            </h3>
            
            {/* Inline Metadata: Reps × Sets + Equipment */}
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <span className="font-medium">
                {exercise.sets} × {exercise.reps} reps
              </span>
              <span>•</span>
              <span>{getEquipmentText(exercise.weight)}</span>
              {exercise.source === 'voice' && (
                <Badge className="text-xs bg-blue-500 text-white px-1">🎤</Badge>
              )}
            </div>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-2 ml-3">
            {/* Muscle Group Icon - Small and Subtle */}
            <span className="text-sm opacity-60">
              {getMuscleGroupIcon(muscleGroup)}
            </span>
            
            {/* Expand/Collapse Chevron */}
            {isExpanded ? (
              <ChevronUp size={16} className="text-slate-400" />
            ) : (
              <ChevronDown size={16} className="text-slate-400" />
            )}
          </div>
        </div>

        {/* Expanded View - Slide Down Animation */}
        {isExpanded && (
          <div className="border-t border-slate-200 bg-slate-50/50 p-4 animate-accordion-down">
            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {onSwap && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSwap(exercise.id);
                    }}
                    className="text-slate-600 hover:text-violet-700 hover:bg-violet-100"
                  >
                    <ArrowUpDown size={14} className="mr-1" />
                    🔄 Swap
                  </Button>
                )}
                
                {onFormTips && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFormTips(exercise.name);
                    }}
                    className="text-slate-600 hover:text-violet-700 hover:bg-violet-100"
                  >
                    <Info size={14} className="mr-1" />
                    📺 Form Tips
                  </Button>
                )}
              </div>

              {!exercise.completed && (
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleComplete(exercise.id);
                  }}
                  className="bg-violet-600 hover:bg-violet-700 text-white"
                >
                  <CheckCircle size={14} className="mr-1" />
                  Mark Done
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Next Up Label */}
        {isNext && (
          <div className="absolute top-2 right-2">
            <Badge className="text-xs bg-violet-500 text-white px-2 py-1">
              Next Up
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
