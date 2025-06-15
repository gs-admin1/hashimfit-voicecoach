
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

  return (
    <Card className={cn("bg-white/90 backdrop-blur-sm border-violet-200/50", className)}>
      <CardContent className="p-4">
        {/* Structured Progress Block */}
        <div className="flex items-center justify-between mb-3 text-sm font-medium text-slate-700">
          <div className="flex items-center space-x-2">
            <CheckCircle size={16} className="text-violet-600" />
            <span>
              ✅ <span className="text-violet-700 font-bold">{completedExercises}</span> of <span className="text-violet-700 font-bold">{totalExercises}</span> completed
            </span>
          </div>
          
          <div className="flex items-center space-x-2 text-slate-600">
            <Clock size={14} />
            <span>⏱ Est. {estimatedTimeLeft} min left</span>
          </div>
        </div>

        {/* Progress Bar with Light Border */}
        <div className="w-full bg-slate-200 rounded-full h-3 border border-slate-300/50">
          <div
            className="bg-gradient-to-r from-violet-600 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
