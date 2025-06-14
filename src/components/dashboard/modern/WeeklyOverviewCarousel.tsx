
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { CheckCircle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeeklyOverviewCarouselProps {
  weekData: Array<{
    date: Date;
    dayName: string;
    isToday: boolean;
    workoutCompleted: boolean;
    mealsLogged: number;
    aiNote?: string | null;
  }>;
  className?: string;
}

export function WeeklyOverviewCarousel({ weekData, className }: WeeklyOverviewCarouselProps) {
  return (
    <Card className={cn("border-0 shadow-lg bg-white/80 backdrop-blur-sm", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center space-x-2">
          <span className="text-2xl">📅</span>
          <span>This Week</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-none">
          {weekData.map((day, index) => (
            <div
              key={index}
              className={cn(
                "flex-shrink-0 w-20 p-3 rounded-lg text-center transition-all duration-200",
                day.isToday 
                  ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg" 
                  : "bg-gray-50 hover:bg-gray-100"
              )}
            >
              <div className="text-xs font-medium mb-1">{day.dayName}</div>
              <div className="text-lg font-bold mb-2">
                {format(day.date, 'd')}
              </div>
              
              {/* Workout Status */}
              <div className="flex justify-center mb-1">
                {day.workoutCompleted ? (
                  <CheckCircle className={cn(
                    "h-4 w-4",
                    day.isToday ? "text-green-300" : "text-green-600"
                  )} />
                ) : (
                  <Circle className={cn(
                    "h-4 w-4",
                    day.isToday ? "text-white/60" : "text-gray-400"
                  )} />
                )}
              </div>
              
              {/* Meals Count */}
              <div className={cn(
                "text-xs",
                day.isToday ? "text-white/80" : "text-gray-600"
              )}>
                {day.mealsLogged}/3 meals
              </div>
              
              {/* AI Note */}
              {day.aiNote && (
                <div className="text-xs mt-1 px-1 py-0.5 bg-yellow-100 text-yellow-800 rounded text-center">
                  {day.aiNote}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
