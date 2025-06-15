
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, RotateCcw, Info, CheckCircle, ArrowUpDown, Clock } from "lucide-react";
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

  // Helper function to get muscle group border color
  const getMuscleGroupBorderColor = (group: string) => {
    switch (group) {
      case 'Chest': return 'border-l-red-400';
      case 'Back': return 'border-l-blue-400';
      case 'Legs': return 'border-l-green-400';
      case 'Shoulders': return 'border-l-yellow-400';
      case 'Arms': return 'border-l-purple-400';
      case 'Core': return 'border-l-orange-400';
      default: return 'border-l-gray-400';
    }
  };

  // Helper function to get equipment text with icon
  const getEquipmentText = (weight: string) => {
    if (weight === 'bodyweight') return '🧘 Bodyweight';
    if (weight.toLowerCase().includes('backpack')) return '🎒 Backpack';
    if (weight.toLowerCase().includes('kg') || weight.toLowerCase().includes('lb')) return `🏋️ ${weight}`;
    return `⚡ ${weight}`;
  };

  const muscleGroup = getMuscleGroup(exercise.name);
  const borderColor = getMuscleGroupBorderColor(muscleGroup);

  // Determine card background (alternating)
  const getCardBackground = () => {
    return exerciseNumber % 2 === 0 ? 'bg-white' : 'bg-slate-50/80';
  };

  return (
    <Card className={cn(
      "transition-all duration-300 overflow-hidden border-l-4",
      getCardBackground(),
      borderColor,
      exercise.completed && "border-l-green-500 bg-green-50/60",
      isNext && "border-l-violet-500 bg-violet-50/60",
      isExpanded && "shadow-lg",
      className
    )}>
      <CardContent className="p-0">
        {/* Compact View */}
        <div
          className="flex items-center p-4 cursor-pointer hover:bg-slate-50/70 transition-colors min-h-[70px]"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {/* Exercise Number Badge */}
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4 flex-shrink-0",
            exercise.completed && "bg-green-500 text-white",
            isNext && "bg-violet-500 text-white",
            !exercise.completed && !isNext && "bg-slate-200 text-slate-600"
          )}>
            {exercise.completed ? <CheckCircle size={16} /> : exerciseNumber}
          </div>

          {/* Exercise Info */}
          <div className="flex-1 min-w-0">
            {/* Exercise Name + Next Up Pill */}
            <div className="flex items-center gap-2 mb-1">
              <h3 className={cn(
                "font-bold text-slate-900 leading-tight text-base truncate",
                exercise.completed && "line-through text-slate-600"
              )}>
                {exercise.name}
              </h3>
              {isNext && (
                <Badge className="text-xs bg-violet-500 text-white px-2 py-0.5 rounded-full">
                  🔜 Next
                </Badge>
              )}
              {exercise.source === 'voice' && (
                <Badge className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">🎤</Badge>
              )}
            </div>
            
            {/* Muscle Group + Metadata Row */}
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="flex items-center gap-1">
                <span className="text-xs">{getMuscleGroupIcon(muscleGroup)}</span>
                <span className="text-xs font-medium">{muscleGroup}</span>
              </div>
              <span className="text-xs">•</span>
              <span className="font-medium text-xs">
                {exercise.sets} × {exercise.reps} reps
              </span>
              <span className="text-xs">•</span>
              <span className="text-xs">{getEquipmentText(exercise.weight)}</span>
            </div>
          </div>

          {/* Right Side - Expand/Collapse Icon */}
          <div className="flex items-center ml-3 flex-shrink-0">
            {isExpanded ? (
              <ChevronUp size={18} className="text-slate-400" />
            ) : (
              <ChevronDown size={18} className="text-slate-400" />
            )}
          </div>
        </div>

        {/* Expanded View - Slide Down Animation */}
        {isExpanded && (
          <div className="border-t border-slate-200 bg-slate-50/50 p-4 animate-accordion-down">
            {/* Rest Timer Info */}
            <div className="flex items-center gap-2 mb-4 text-sm text-slate-600">
              <Clock size={14} className="text-violet-500" />
              <span>Rest 60s between sets</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {onSwap && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSwap(exercise.id);
                    }}
                    className="text-slate-600 hover:text-violet-700 hover:bg-violet-100 text-xs px-3 py-2"
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
                    className="text-slate-600 hover:text-violet-700 hover:bg-violet-100 text-xs px-3 py-2"
                  >
                    <Info size={14} className="mr-1" />
                    📺 Form Tips
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                  className="text-slate-600 hover:text-violet-700 hover:bg-violet-100 text-xs px-3 py-2"
                >
                  📝 Notes
                </Button>
              </div>

              {!exercise.completed && (
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleComplete(exercise.id);
                  }}
                  className="bg-violet-600 hover:bg-violet-700 text-white text-xs px-4 py-2"
                >
                  <CheckCircle size={14} className="mr-1" />
                  ✅ Mark Done
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
