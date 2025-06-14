
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
  Circle
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
  
  const getWorkoutTypeColor = (type?: string) => {
    const colors = {
      strength: "bg-red-100 text-red-700 border-red-200",
      cardio: "bg-green-100 text-green-700 border-green-200",
      recovery: "bg-purple-100 text-purple-700 border-purple-200",
      rest: "bg-gray-100 text-gray-700 border-gray-200"
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getWorkoutIcon = (type?: string) => {
    switch (type) {
      case 'cardio': return <Heart size={12} />;
      case 'recovery': return <Circle size={12} />;
      default: return <Dumbbell size={12} />;
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
                    "p-3 rounded-lg border transition-all cursor-pointer",
                    isSelected 
                      ? "border-hashim-300 bg-hashim-50" 
                      : "border-gray-200 hover:border-gray-300",
                    isToday && "ring-2 ring-hashim-200"
                  )}
                  onClick={() => onDaySelect(day.date)}
                >
                  <div className="flex items-center justify-between mb-2">
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
                      className="h-6 w-6 p-0"
                    >
                      <Plus size={12} />
                    </Button>
                  </div>
                  
                  {/* Workout Section */}
                  <div className="space-y-2">
                    {day.workoutTitle ? (
                      <div className={cn(
                        "flex items-center gap-2 p-2 rounded border text-xs",
                        getWorkoutTypeColor(day.workoutType)
                      )}>
                        {getWorkoutIcon(day.workoutType)}
                        <span className="font-medium">{day.workoutTitle}</span>
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground italic p-2 border border-dashed rounded">
                        Rest Day
                      </div>
                    )}
                    
                    {/* Metrics Row */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <Utensils size={10} />
                        <span>{day.mealsLogged}/{day.mealGoal} meals</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {day.habitCompletion >= 80 ? (
                          <CheckCircle size={10} className="text-green-600" />
                        ) : (
                          <Circle size={10} className="text-gray-400" />
                        )}
                        <span>{day.habitCompletion}% habits</span>
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
