
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  X,
  Clock,
  Calendar,
  Target,
  TrendingUp,
  Flame,
  MessageCircle,
  RotateCcw,
  Settings,
  Star,
  Zap,
  Award,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight: string;
  completed?: boolean;
  source?: 'planned' | 'voice';
  actualSets?: number;
  actualReps?: string;
  actualWeight?: string;
  notes?: string;
}

interface WorkoutResultsData {
  id: string;
  title: string;
  exercises: Exercise[];
  duration: number; // in minutes
  completedDate: string;
  caloriesBurned?: number;
  rating?: number;
  notes?: string;
  aiModifications?: boolean;
  streak?: number;
}

interface WorkoutResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  workoutData: WorkoutResultsData | null;
  onRepeatWorkout?: () => void;
  onCustomizePlan?: () => void;
  onAskCoach?: () => void;
  onViewHistory?: () => void;
}

export function WorkoutResultsModal({
  isOpen,
  onClose,
  workoutData,
  onRepeatWorkout,
  onCustomizePlan,
  onAskCoach,
  onViewHistory
}: WorkoutResultsModalProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['exercises']));

  if (!workoutData) return null;

  const completedExercises = workoutData.exercises.filter(ex => ex.completed).length;
  const totalExercises = workoutData.exercises.length;
  const completionRate = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getIntensityBadge = () => {
    if (completionRate >= 90) return { emoji: "🔥", label: "High Intensity", color: "bg-red-100 text-red-700" };
    if (completionRate >= 70) return { emoji: "💪", label: "Good Effort", color: "bg-orange-100 text-orange-700" };
    return { emoji: "⚡", label: "Light Session", color: "bg-blue-100 text-blue-700" };
  };

  const intensityBadge = getIntensityBadge();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold text-center">
            Workout Complete! 🎉
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Workout Overview Card */}
          <Card className="border-l-4 border-l-green-500 bg-green-50/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{workoutData.title}</CardTitle>
                {workoutData.streak && workoutData.streak > 1 && (
                  <Badge className="bg-orange-100 text-orange-700">
                    <Flame size={12} className="mr-1" />
                    {workoutData.streak} streak
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Key Stats Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock size={16} className="text-muted-foreground" />
                  <span className="font-medium">{workoutData.duration} min</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={16} className="text-muted-foreground" />
                  <span>{format(new Date(workoutData.completedDate), 'MMM d, h:mm a')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Target size={16} className="text-muted-foreground" />
                  <span>{completedExercises}/{totalExercises} completed</span>
                </div>
                {workoutData.caloriesBurned && (
                  <div className="flex items-center gap-2 text-sm">
                    <Flame size={16} className="text-muted-foreground" />
                    <span>{workoutData.caloriesBurned} cal</span>
                  </div>
                )}
              </div>

              {/* Completion Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Completion Rate</span>
                  <span className="font-semibold">{Math.round(completionRate)}%</span>
                </div>
                <Progress value={completionRate} className="h-2" />
              </div>

              {/* Badges Row */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={cn("text-xs px-2 py-1", intensityBadge.color)}>
                  {intensityBadge.emoji} {intensityBadge.label}
                </Badge>
                {workoutData.aiModifications && (
                  <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                    <Zap size={10} className="mr-1" />
                    AI Enhanced
                  </Badge>
                )}
                {workoutData.rating && workoutData.rating >= 4 && (
                  <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700">
                    <Star size={10} className="mr-1" />
                    Great Session
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Exercise Breakdown */}
          <Card>
            <CardHeader 
              className="pb-3 cursor-pointer"
              onClick={() => toggleSection('exercises')}
            >
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Exercise Breakdown</CardTitle>
                {expandedSections.has('exercises') ? (
                  <ChevronDown size={20} />
                ) : (
                  <ChevronRight size={20} />
                )}
              </div>
            </CardHeader>
            {expandedSections.has('exercises') && (
              <CardContent className="space-y-3">
                {workoutData.exercises.map((exercise, index) => (
                  <div
                    key={exercise.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border",
                      exercise.completed 
                        ? "bg-green-50 border-green-200" 
                        : "bg-gray-50 border-gray-200"
                    )}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex-shrink-0">
                        {exercise.completed ? (
                          <CheckCircle size={20} className="text-green-600" />
                        ) : (
                          <X size={20} className="text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className={cn(
                            "font-medium text-sm",
                            !exercise.completed && "text-gray-500"
                          )}>
                            {exercise.name}
                          </p>
                          {exercise.source === 'voice' && (
                            <Badge variant="outline" className="text-xs">
                              Voice
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {exercise.completed ? (
                            <span>
                              {exercise.actualSets || exercise.sets} × {exercise.actualReps || exercise.reps}
                              {exercise.actualWeight && exercise.actualWeight !== 'bodyweight' && 
                                ` @ ${exercise.actualWeight}`
                              }
                            </span>
                          ) : (
                            <span className="italic">Skipped</span>
                          )}
                        </div>
                        {exercise.notes && (
                          <p className="text-xs text-blue-600 mt-1">{exercise.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>

          {/* Performance Highlights */}
          {(workoutData.rating || workoutData.caloriesBurned) && (
            <Card>
              <CardHeader 
                className="pb-3 cursor-pointer"
                onClick={() => toggleSection('performance')}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Performance Highlights</CardTitle>
                  {expandedSections.has('performance') ? (
                    <ChevronDown size={20} />
                  ) : (
                    <ChevronRight size={20} />
                  )}
                </div>
              </CardHeader>
              {expandedSections.has('performance') && (
                <CardContent className="space-y-4">
                  {workoutData.rating && (
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <TrendingUp size={16} className="text-blue-600" />
                        <span className="text-sm font-medium">Session Rating</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={cn(
                              i < workoutData.rating! 
                                ? "text-yellow-500 fill-current" 
                                : "text-gray-300"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {completionRate === 100 && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                      <Award size={16} className="text-green-600" />
                      <span className="text-sm font-medium text-green-700">
                        Perfect Completion! 🏆
                      </span>
                    </div>
                  )}

                  {workoutData.notes && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Session Notes:</p>
                      <p className="text-sm">{workoutData.notes}</p>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Primary Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={onRepeatWorkout}
                className="flex items-center justify-center gap-2"
              >
                <RotateCcw size={16} />
                Repeat Workout
              </Button>
              <Button
                variant="outline"
                onClick={onAskCoach}
                className="flex items-center justify-center gap-2"
              >
                <MessageCircle size={16} />
                Ask Coach
              </Button>
            </div>

            {/* Secondary Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="ghost"
                onClick={onViewHistory}
                className="flex items-center justify-center gap-2 text-muted-foreground"
              >
                <TrendingUp size={16} />
                View History
              </Button>
              <Button
                variant="ghost"
                onClick={onCustomizePlan}
                className="flex items-center justify-center gap-2 text-muted-foreground"
              >
                <Settings size={16} />
                Customize
              </Button>
            </div>

            {/* Done Button */}
            <Button 
              onClick={onClose}
              className="w-full bg-hashim-600 hover:bg-hashim-700 text-white"
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
