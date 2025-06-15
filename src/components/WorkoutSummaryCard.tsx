
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Target, Dumbbell, Sparkles, Calendar, Zap, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkoutSummaryCardProps {
  workout: {
    title: string;
    category: string;
    difficulty: number;
    estimatedDuration: number;
    exercises: any[];
    targetMuscles: string[];
    aiGenerated?: boolean;
    isCompleted?: boolean;
  };
  onStartWorkout: () => void;
  className?: string;
}

export function WorkoutSummaryCard({ workout, onStartWorkout, className }: WorkoutSummaryCardProps) {
  const getCurrentTime = () => {
    const now = new Date();
    const finishTime = new Date(now.getTime() + workout.estimatedDuration * 60000);
    return finishTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getIntensityIcon = () => {
    if (workout.difficulty >= 7) return <Zap size={16} className="text-orange-500" />;
    if (workout.aiGenerated) return <Sparkles size={16} className="text-purple-500" />;
    return <Calendar size={16} className="text-blue-500" />;
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'strength': return 'bg-violet-100 text-violet-800 border-violet-200';
      case 'cardio': return 'bg-red-100 text-red-800 border-red-200';
      case 'flexibility': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <Card className={cn("bg-white/90 backdrop-blur-sm border-violet-200/50 shadow-lg", className)}>
      <CardContent className="p-6 space-y-4">
        {/* Header with Icon and Title */}
        <div className="flex items-start space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Dumbbell className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-slate-900 leading-tight mb-2">
              🏋️ {workout.title}
            </h2>
            <div className="flex items-center space-x-2 flex-wrap gap-2">
              <Badge className={cn("text-xs font-medium", getCategoryColor(workout.category))}>
                💪 {workout.category} ({workout.difficulty >= 7 ? 'Advanced' : workout.difficulty >= 4 ? 'Intermediate' : 'Beginner'})
              </Badge>
              {workout.aiGenerated && (
                <Badge className="text-xs bg-purple-500 text-white">
                  {getIntensityIcon()} AI Generated
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Workout Stats */}
        <div className="grid grid-cols-3 gap-4 py-3 px-4 bg-slate-50 rounded-xl">
          <div className="text-center">
            <div className="flex items-center justify-center text-violet-600 mb-1">
              <Clock className="h-4 w-4" />
            </div>
            <p className="text-lg font-bold text-slate-900">{workout.estimatedDuration}</p>
            <p className="text-xs text-slate-500">min</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center text-violet-600 mb-1">
              <Target className="h-4 w-4" />
            </div>
            <p className="text-lg font-bold text-slate-900">{workout.exercises.length}</p>
            <p className="text-xs text-slate-500">exercises</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center text-violet-600 mb-1">
              <Dumbbell className="h-4 w-4" />
            </div>
            <p className="text-lg font-bold text-slate-900">{workout.difficulty}</p>
            <p className="text-xs text-slate-500">/10</p>
          </div>
        </div>

        {/* Estimated Finish Time */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
          <p className="text-sm text-indigo-800">
            🎯 <span className="font-medium">Estimated Finish:</span> {getCurrentTime()} 
            <span className="text-indigo-600 ml-1">(if started now)</span>
          </p>
        </div>

        {/* Start Workout Button */}
        {!workout.isCompleted && (
          <Button
            onClick={onStartWorkout}
            size="lg"
            className="w-full h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Play size={18} className="mr-2" />
            Start Workout
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
