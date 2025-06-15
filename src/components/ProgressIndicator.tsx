
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Clock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  totalExercises: number;
  completedExercises: number;
  estimatedTimeLeft: number;
  className?: string;
}

export function ProgressIndicator({
  totalExercises,
  completedExercises,
  estimatedTimeLeft,
  className
}: ProgressIndicatorProps) {
  const progressPercentage = (completedExercises / totalExercises) * 100;
  
  const getProgressDots = () => {
    return Array.from({ length: totalExercises }, (_, index) => (
      <div
        key={index}
        className={cn(
          "w-3 h-3 rounded-full transition-all duration-300",
          index < completedExercises 
            ? "bg-violet-600 scale-110" 
            : "bg-slate-200"
        )}
      />
    ));
  };

  return (
    <Card className={cn("bg-white/90 backdrop-blur-sm border-violet-200/50", className)}>
      <CardContent className="p-4">
        {/* Progress Stats */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <CheckCircle size={16} className="text-violet-600" />
            <span className="text-sm font-medium text-slate-700">
              <span className="text-violet-700 font-bold">{completedExercises}</span>
              <span className="mx-1">of</span>
              <span className="text-violet-700 font-bold">{totalExercises}</span>
              <span className="ml-1">completed</span>
            </span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <Clock size={14} />
            <span>Est. {estimatedTimeLeft} min left</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-2 mb-3">
          <div
            className="bg-gradient-to-r from-violet-600 to-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Progress Dots */}
        <div className="flex items-center justify-center space-x-2">
          {getProgressDots()}
        </div>
      </CardContent>
    </Card>
  );
}
