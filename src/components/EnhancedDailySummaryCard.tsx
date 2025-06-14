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
  Flame,
  RefreshCw,
  Zap,
  Info
} from "lucide-react";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface WorkoutOption {
  type: 'strength' | 'cardio' | 'recovery' | 'rest';
  label: string;
  icon: React.ReactNode;
  color: string;
  emoji: string;
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
  onAddAnotherSession?: () => void;
  onPreLogMeal?: (date: Date) => void;
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
  onAddAnotherSession,
  onPreLogMeal,
  className
}: EnhancedDailySummaryCardProps) {
  const [showWorkoutOptions, setShowWorkoutOptions] = useState(false);
  const [showMealSuggestions, setShowMealSuggestions] = useState(false);
  const [showFormTip, setShowFormTip] = useState(false);

  const workoutOptions: WorkoutOption[] = [
    { type: 'strength', label: 'Strength', icon: <Dumbbell size={14} />, color: 'bg-red-100 text-red-700 border-red-200', emoji: '🏋️' },
    { type: 'cardio', label: 'Cardio', icon: <Heart size={14} />, color: 'bg-green-100 text-green-700 border-green-200', emoji: '🏃‍♂️' },
    { type: 'recovery', label: 'Recovery', icon: <RefreshCw size={14} />, color: 'bg-purple-100 text-purple-700 border-purple-200', emoji: '🧘' },
    { type: 'rest', label: 'Rest', icon: <Circle size={14} />, color: 'bg-gray-100 text-gray-700 border-gray-200', emoji: '💤' },
  ];

  const suggestedMeals = [
    "🍗 Grilled Chicken Bowl (35g protein)",
    "🐟 Salmon with Quinoa (32g protein)", 
    "🥩 Lean Beef Stir-fry (40g protein)"
  ];

  const completedHabits = habits.filter(h => h.isCompleted).length;
  const habitPercentage = habits.length > 0 ? (completedHabits / habits.length) * 100 : 0;

  const getMissingProteinMessage = () => {
    const totalProtein = meals.reduce((sum, meal) => sum + (meal.protein_g || 0), 0);
    if (totalProtein < 100) {
      return "You've missed protein targets 3 days — want help planning tomorrow's food?";
    }
    return null;
  };

  const getCoachNote = () => {
    if (workout?.bodyFocus?.includes('legs')) {
      return "Focus on hamstrings today — form reminder: slow eccentrics";
    }
    return "Remember to maintain proper form throughout your workout";
  };

  const getWorkoutSwapSuggestion = () => {
    if (workout?.title?.includes('Upper')) {
      return "Need a lighter day? Try: Recovery Mobility Flow 🧘";
    }
    return "Want to switch it up? Try a different workout style";
  };

  const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  const isFuture = date > new Date();

  return (
    <Card className={cn("transition-all duration-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar size={20} />
            {format(date, 'EEEE, MMM d')}
            {isToday && <Badge className="bg-hashim-100 text-hashim-700">Today</Badge>}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Workout Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Dumbbell size={16} className="text-blue-600" />
              Workout
            </h3>
            {!workout && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowWorkoutOptions(!showWorkoutOptions)}
                className="text-hashim-600 hover:text-hashim-700 hover:bg-hashim-50"
              >
                <Plus size={14} className="mr-1" />
                Add
              </Button>
            )}
          </div>

          {workout ? (
            <div className="space-y-3 animate-fade-in">
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
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditWorkout(workout)}
                    className="text-xs"
                  >
                    Swap Day
                  </Button>
                </div>
              </div>
              
              {/* AI Coach Note */}
              <div className="flex items-start gap-2 p-2 bg-purple-50 rounded text-xs border border-purple-200">
                <Brain size={12} className="text-purple-600 mt-0.5" />
                <p className="text-purple-700">{getCoachNote()}</p>
              </div>

              {/* Workout Options */}
              {isToday && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onAddAnotherSession}
                    className="flex-1 text-xs"
                  >
                    <Plus size={12} className="mr-1" />
                    Add Another Session
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowWorkoutOptions(true)}
                    className="flex-1 text-xs"
                  >
                    <RefreshCw size={12} className="mr-1" />
                    Convert to Cardio
                  </Button>
                </div>
              )}

              {/* Swap Suggestion */}
              <div className="p-2 bg-blue-50 rounded border border-blue-200">
                <p className="text-xs text-blue-700 mb-1">{getWorkoutSwapSuggestion()}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSwapDay('recovery')}
                  className="text-xs h-6"
                >
                  Swap Workout
                </Button>
              </div>
            </div>
          ) : showWorkoutOptions ? (
            <div className="grid grid-cols-2 gap-2 animate-fade-in">
              {workoutOptions.map((option) => (
                <Button
                  key={option.type}
                  variant="outline"
                  className={cn("flex items-center gap-2 h-12 border", option.color)}
                  onClick={() => {
                    onSwapDay(option.type);
                    setShowWorkoutOptions(false);
                  }}
                >
                  <span className="text-sm">{option.emoji}</span>
                  {option.icon}
                  {option.label}
                </Button>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground border border-dashed rounded-lg bg-gray-50">
              <p className="text-sm">💤 Rest day planned</p>
            </div>
          )}
        </div>

        {/* Nutrition Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Utensils size={16} className="text-green-600" />
              Nutrition
            </h3>
            <span className="text-sm text-muted-foreground">{meals.length}/4 meals</span>
          </div>

          {meals.length > 0 ? (
            <div className="space-y-2">
              {meals.slice(0, 2).map((meal, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                  <span className="text-sm">{meal.meal_title || 'Meal'}</span>
                  <span className="text-xs text-muted-foreground">{meal.calories || 0} cal</span>
                </div>
              ))}
              {meals.length > 2 && (
                <p className="text-xs text-muted-foreground text-center">+{meals.length - 2} more meals</p>
              )}
              
              {isFuture && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPreLogMeal?.(date)}
                  className="w-full text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <Plus size={12} className="mr-1" />
                  Pre-log meals for {format(date, 'MMM d')}
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3 animate-fade-in">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700 mb-3">
                  {getMissingProteinMessage() || "Still missing meals today — want help planning tomorrow's food?"}
                </p>
                
                {showMealSuggestions ? (
                  <div className="space-y-2 mb-3">
                    <p className="text-xs text-blue-600 font-medium">Try these high-protein meals:</p>
                    {suggestedMeals.map((meal, index) => (
                      <div key={index} className="text-xs text-blue-700 p-1 bg-white rounded border">
                        {meal}
                      </div>
                    ))}
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMealSuggestions(true)}
                    className="mb-3 text-xs text-blue-600 hover:text-blue-700 h-6"
                  >
                    <Zap size={10} className="mr-1" />
                    Show suggested meals
                  </Button>
                )}
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onScanPlate}
                    className="flex-1 text-xs h-8"
                  >
                    <Camera size={12} className="mr-1" />
                    📸 Scan Plate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onUseTemplate}
                    className="flex-1 text-xs h-8"
                  >
                    <Utensils size={12} className="mr-1" />
                    🍱 Use Template
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onAskCoach}
                    className="flex-1 text-xs h-8"
                  >
                    <Brain size={12} className="mr-1" />
                    🧠 Ask Coach
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Habits Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Target size={16} className="text-purple-600" />
              Habits
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{completedHabits}/{habits.length}</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFormTip(!showFormTip)}
                      className="h-6 w-6 p-0"
                    >
                      <Info size={12} className="text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Consistency tip: Small daily actions create lasting change</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className="space-y-2">
            <Progress value={habitPercentage} className="h-2" />
            <div className="grid gap-2">
              {habits.slice(0, 3).map((habit, index) => (
                <div key={index} className={cn(
                  "flex items-center justify-between p-2 rounded border transition-all",
                  habit.isCompleted ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                )}>
                  <div className="flex items-center gap-2">
                    {habit.isCompleted ? (
                      <CheckCircle size={14} className="text-green-600" />
                    ) : (
                      <Circle size={14} className="text-gray-400" />
                    )}
                    <span className="text-sm">{habit.name}</span>
                    {habit.name === 'Water Intake' && habit.isCompleted && (
                      <Badge className="text-xs bg-orange-100 text-orange-700">
                        🔥 5-day streak!
                      </Badge>
                    )}
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
              className="w-full text-xs text-muted-foreground hover:text-hashim-600 hover:bg-hashim-50"
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
