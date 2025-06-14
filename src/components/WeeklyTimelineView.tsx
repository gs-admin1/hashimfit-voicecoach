
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Plus, 
  Dumbbell, 
  UtensilsCrossed, 
  CheckCircle,
  Flame,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { format, isBefore, isToday } from "date-fns";
import { cn } from "@/lib/utils";

interface WeeklyTimelineProps {
  weekData: Array<{
    date: Date;
    workoutTitle?: string;
    workoutType: 'strength' | 'cardio' | 'recovery' | 'rest';
    mealsLogged: number;
    mealGoal: number;
    habitCompletion: number;
    isToday: boolean;
  }>;
  selectedDate: Date;
  onDaySelect: (date: Date) => void;
  onAddWorkout: () => void;
  className?: string;
}

export function WeeklyTimelineView({
  weekData,
  selectedDate,
  onDaySelect,
  onAddWorkout,
  className
}: WeeklyTimelineProps) {
  const [showPastDays, setShowPastDays] = useState(true);

  const getWorkoutIcon = (type: string, completed: boolean = false) => {
    if (completed) return <CheckCircle className="h-3 w-3 text-green-600" />;
    
    switch (type) {
      case 'strength': return <Dumbbell className="h-3 w-3 text-blue-600" />;
      case 'cardio': return <Flame className="h-3 w-3 text-red-600" />;
      case 'recovery': return <div className="h-3 w-3 rounded-full bg-purple-600" />;
      default: return <div className="h-3 w-3 rounded-full bg-gray-300" />;
    }
  };

  const getMealProgress = (logged: number, goal: number) => {
    const percentage = (logged / goal) * 100;
    if (percentage >= 75) return 'bg-green-500';
    if (percentage >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getHabitProgress = (completion: number) => {
    if (completion >= 75) return 'bg-green-500';
    if (completion >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getMostConsistentDay = () => {
    if (weekData.length === 0) return null;
    
    return weekData.reduce((best, current) => 
      current.habitCompletion > best.habitCompletion ? current : best
    );
  };

  const mostConsistent = getMostConsistentDay();

  return (
    <Card className={cn("transition-all duration-300 animate-fade-in", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            📅 Weekly Timeline
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPastDays(!showPastDays)}
            className="text-xs text-muted-foreground"
          >
            {showPastDays ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {showPastDays ? 'Collapse' : 'Expand'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {weekData.map((day, index) => {
          const isSelected = format(day.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
          const isPast = isBefore(day.date, new Date()) && !isToday(day.date);
          const isMostConsistent = mostConsistent && day.date.getTime() === mostConsistent.date.getTime();
          
          // Hide past days if collapsed, but always show today and future
          if (!showPastDays && isPast) return null;

          return (
            <div
              key={index}
              onClick={() => onDaySelect(day.date)}
              className={cn(
                "p-3 rounded-lg border cursor-pointer transition-all",
                isSelected 
                  ? "bg-hashim-50 border-hashim-200 shadow-sm" 
                  : "bg-gray-50 border-gray-200 hover:bg-gray-100",
                day.isToday && "ring-2 ring-hashim-300"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className={cn(
                    "font-medium",
                    day.isToday && "text-hashim-600"
                  )}>
                    {format(day.date, 'EEEE')}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {format(day.date, 'MMM d')}
                  </span>
                  {day.isToday && (
                    <Badge variant="secondary" className="text-xs">Today</Badge>
                  )}
                  {isMostConsistent && (
                    <Badge className="text-xs bg-orange-100 text-orange-700">
                      🔥 Most Consistent
                    </Badge>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {/* Workout Status */}
                  {day.workoutTitle ? (
                    <div className="flex items-center space-x-1">
                      {getWorkoutIcon(day.workoutType, true)}
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddWorkout();
                      }}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-hashim-600"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  )}

                  {/* Meal Progress Circle */}
                  <div className="flex items-center space-x-1">
                    <UtensilsCrossed className="h-3 w-3 text-muted-foreground" />
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      getMealProgress(day.mealsLogged, day.mealGoal)
                    )} />
                  </div>

                  {/* Habit Progress Circle */}
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    getHabitProgress(day.habitCompletion)
                  )} />
                </div>
              </div>

              {day.workoutTitle && (
                <div className="text-xs text-muted-foreground">
                  💪 {day.workoutTitle}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                <span>🍽 {day.mealsLogged}/{day.mealGoal} meals</span>
                <span>📈 {day.habitCompletion}% habits</span>
              </div>
            </div>
          );
        })}

        {/* Legend */}
        <div className="p-2 bg-muted/30 rounded text-xs text-muted-foreground">
          <div className="flex justify-between items-center mb-1">
            <span className="font-medium">Status Legend:</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <span>🟢 75%+ complete</span>
            <span>🟡 25-75% complete</span>
            <span>🔴 &lt;25% complete</span>
            <span>🔥 Most consistent</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
