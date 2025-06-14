
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar,
  Plus,
  Dumbbell,
  Heart,
  Utensils,
  Camera,
  Brain,
  CheckCircle,
  Circle,
  Clock,
  Target,
  Flame
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface WorkoutOption {
  type: 'workout' | 'cardio' | 'recovery' | 'rest';
  label: string;
  icon: React.ReactNode;
  color: string;
}

interface EnhancedDailySummaryCardProps {
  date: Date;
  workout?: any;
  meals: any[];
  habits: any[];
  onAddWorkout: () => void;
  onEditWorkout: (workout: any) => void;
  onAddMeal: () => void;
  onScanPlate: () => void;
  onUseTemplate: () => void;
  onAskCoach: () => void;
  onSwapDay: (type: string) => void;
  className?: string;
}

export function EnhancedDailySummaryCard({
  date,
  workout,
  meals,
  habits,
  onAddWorkout,
  onEditWorkout,
  onAddMeal,
  onScanPlate,
  onUseTemplate,
  onAskCoach,
  onSwapDay,
  className
}: EnhancedDailySummaryCardProps) {
  const [showWorkoutOptions, setShowWorkoutOptions] = useState(false);

  const workoutOptions: WorkoutOption[] = [
    { type: 'workout', label: 'Strength', icon: <Dumbbell size={14} />, color: 'bg-red-100 text-red-700' },
    { type: 'cardio', label: 'Cardio', icon: <Heart size={14} />, color: 'bg-green-100 text-green-700' },
    { type: 'recovery', label: 'Recovery', icon: <Circle size={14} />, color: 'bg-purple-100 text-purple-700' },
    { type: 'rest', label: 'Rest', icon: <Circle size={14} />, color: 'bg-gray-100 text-gray-700' },
  ];

  const completedHabits = habits.filter(h => h.isCompleted).length;
  const habitPercentage = habits.length > 0 ? (completedHabits / habits.length) * 100 : 0;

  const getMissingProteinMessage = () => {
    const totalProtein = meals.reduce((sum, meal) => sum + (meal.protein_g || 0), 0);
    if (totalProtein < 100) {
      return "You've missed protein targets 3 days - want help planning tomorrow's food?";
    }
    return null;
  };

  const getCoachNote = () => {
    if (workout?.bodyFocus?.includes('legs')) {
      return "Focus on hamstrings today — form reminder: slow eccentrics";
    }
    return "Remember to maintain proper form throughout your workout";
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar size={20} />
            {format(date, 'EEEE, MMM d')}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Workout Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Workout</h3>
            {!workout && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowWorkoutOptions(!showWorkoutOptions)}
                className="text-hashim-600 hover:text-hashim-700"
              >
                <Plus size={14} className="mr-1" />
                Add Workout
              </Button>
            )}
          </div>

          {workout ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-hashim-50 rounded-lg border border-hashim-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-hashim-100 rounded">
                    <Dumbbell size={16} className="text-hashim-600" />
                  </div>
                  <div>
                    <p className="font-medium">{workout.title}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {workout.duration}min
                      </span>
                      <span className="flex items-center gap-1">
                        <Target size={10} />
                        {workout.exercises} exercises
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditWorkout(workout)}
                >
                  Swap Day
                </Button>
              </div>
              
              {/* AI Coach Note */}
              <div className="flex items-start gap-2 p-2 bg-purple-50 rounded text-xs">
                <Brain size={12} className="text-purple-600 mt-0.5" />
                <p className="text-purple-700">{getCoachNote()}</p>
              </div>
            </div>
          ) : showWorkoutOptions ? (
            <div className="grid grid-cols-2 gap-2 animate-fade-in">
              {workoutOptions.map((option) => (
                <Button
                  key={option.type}
                  variant="outline"
                  className={cn("flex items-center gap-2 h-12", option.color)}
                  onClick={() => {
                    onSwapDay(option.type);
                    setShowWorkoutOptions(false);
                  }}
                >
                  {option.icon}
                  {option.label}
                </Button>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground border border-dashed rounded-lg">
              <p className="text-sm">Rest day planned</p>
            </div>
          )}
        </div>

        {/* Nutrition Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Nutrition</h3>
            <span className="text-sm text-muted-foreground">{meals.length}/4 meals</span>
          </div>

          {meals.length > 0 ? (
            <div className="space-y-2">
              {meals.slice(0, 2).map((meal, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{meal.meal_title || 'Meal'}</span>
                  <span className="text-xs text-muted-foreground">{meal.calories || 0} cal</span>
                </div>
              ))}
              {meals.length > 2 && (
                <p className="text-xs text-muted-foreground text-center">+{meals.length - 2} more meals</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700 mb-2">
                  {getMissingProteinMessage() || "Still missing meals today — want help planning tomorrow's food?"}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onScanPlate}
                    className="flex-1 text-xs"
                  >
                    <Camera size={12} className="mr-1" />
                    Scan Plate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onUseTemplate}
                    className="flex-1 text-xs"
                  >
                    <Utensils size={12} className="mr-1" />
                    Use Template
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onAskCoach}
                    className="flex-1 text-xs"
                  >
                    <Brain size={12} className="mr-1" />
                    Ask Coach
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Habits Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Habits</h3>
            <span className="text-sm text-muted-foreground">{completedHabits}/{habits.length}</span>
          </div>

          <div className="space-y-2">
            <Progress value={habitPercentage} className="h-2" />
            <div className="grid gap-2">
              {habits.slice(0, 3).map((habit, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    {habit.isCompleted ? (
                      <CheckCircle size={14} className="text-green-600" />
                    ) : (
                      <Circle size={14} className="text-gray-400" />
                    )}
                    <span className="text-sm">{habit.name}</span>
                  </div>
                  {habit.target && (
                    <span className="text-xs text-muted-foreground">
                      {habit.current}/{habit.target} {habit.unit}
                    </span>
                  )}
                </div>
              ))}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground"
            >
              <Plus size={12} className="mr-1" />
              Add Custom Habit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
