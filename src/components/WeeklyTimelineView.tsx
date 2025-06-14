
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Dumbbell, 
  Heart, 
  Utensils, 
  Plus,
  CheckCircle,
  Circle,
  RefreshCw
} from "lucide-react";
import { format, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";

interface DayData {
  date: Date;
  workoutTitle?: string;
  workoutType?: 'strength' | 'cardio' | 'recovery' | 'rest';
  mealsLogged: number;
  mealGoal: number;
  habitCompletion: number;
  isToday?: boolean;
}

interface WeeklyTimelineViewProps {
  weekData: DayData[];
  selectedDate: Date;
  onDaySelect: (date: Date) => void;
  onAddWorkout: (date: Date) => void;
  className?: string;
}

export function WeeklyTimelineView({
  weekData,
  selectedDate,
  onDaySelect,
  onAddWorkout,
  className
}: WeeklyTimelineViewProps) {
  
  const getWorkoutBadgeStyle = (type?: string) => {
    const styles = {
      strength: "bg-red-100 text-red-700 border-red-200",
      cardio: "bg-green-100 text-green-700 border-green-200",
      recovery: "bg-purple-100 text-purple-700 border-purple-200",
      rest: "bg-gray-100 text-gray-500 border-gray-200"
    };
    return styles[type as keyof typeof styles] || "bg-gray-100 text-gray-500 border-gray-200";
  };

  const getWorkoutIcon = (type?: string) => {
    switch (type) {
      case 'cardio': return <Heart size={12} />;
      case 'recovery': return <RefreshCw size={12} />;
      case 'strength': return <Dumbbell size={12} />;
      default: return <Circle size={12} />;
    }
  };

  const getWorkoutEmoji = (type?: string) => {
    switch (type) {
      case 'strength': return '🏋️';
      case 'cardio': return '🏃‍♂️';
      case 'recovery': return '🧘';
      default: return '💤';
    }
  };

  return (
    <Card className={cn("", className)}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground mb-3">Weekly Overview</h3>
          
          <div className="grid grid-cols-1 gap-3">
            {weekData.map((day, index) => {
              const isSelected = isSameDay(day.date, selectedDate);
              const isToday = isSameDay(day.date, new Date());
              
              return (
                <div
                  key={index}
                  className={cn(
                    "p-3 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-md",
                    isSelected 
                      ? "border-hashim-300 bg-hashim-50 shadow-sm" 
                      : "border-gray-200 hover:border-gray-300 bg-white",
                    isToday && "ring-2 ring-hashim-200"
                  )}
                  onClick={() => onDaySelect(day.date)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "font-medium",
                        isToday && "text-hashim-600"
                      )}>
                        {format(day.date, 'EEEE')}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(day.date, 'MMM d')}
                      </span>
                      {isToday && (
                        <Badge variant="secondary" className="text-xs">Today</Badge>
                      )}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddWorkout(day.date);
                      }}
                      className="h-6 w-6 p-0 hover:bg-hashim-100"
                    >
                      <Plus size={12} />
                    </Button>
                  </div>
                  
                  {/* Workout Section */}
                  <div className="space-y-2">
                    {day.workoutTitle ? (
                      <div className="flex items-center gap-2">
                        <Badge 
                          className={cn(
                            "flex items-center gap-1 text-xs border",
                            getWorkoutBadgeStyle(day.workoutType)
                          )}
                        >
                          <span className="text-sm">{getWorkoutEmoji(day.workoutType)}</span>
                          {getWorkoutIcon(day.workoutType)}
                          <span className="font-medium">{day.workoutTitle}</span>
                        </Badge>
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground italic p-2 border border-dashed rounded bg-gray-50">
                        💤 Rest Day
                      </div>
                    )}
                    
                    {/* Metrics Row */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <Utensils size={10} className="text-orange-500" />
                        <span className={cn(
                          day.mealsLogged >= day.mealGoal ? "text-green-600" : "text-orange-600"
                        )}>
                          {day.mealsLogged}/{day.mealGoal} meals
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {day.habitCompletion >= 80 ? (
                          <CheckCircle size={10} className="text-green-600" />
                        ) : (
                          <Circle size={10} className="text-gray-400" />
                        )}
                        <span className={cn(
                          day.habitCompletion >= 80 ? "text-green-600" : 
                          day.habitCompletion >= 60 ? "text-yellow-600" : "text-red-500"
                        )}>
                          {day.habitCompletion}% habits
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
