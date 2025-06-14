
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Camera, Edit } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionsWidgetProps {
  onLogWorkout?: () => void;
  onLogMeal?: () => void;
  onManualEntry?: () => void;
  className?: string;
}

export function QuickActionsWidget({
  onLogWorkout,
  onLogMeal,
  onManualEntry,
  className
}: QuickActionsWidgetProps) {
  return (
    <Card className={cn("animate-fade-in", className)}>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Log Workout Card */}
          <div 
            className="relative bg-gradient-to-br from-red-500 to-hashim-600 rounded-2xl p-4 text-white cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 min-h-[120px] flex flex-col justify-between shadow-lg"
            onClick={onLogWorkout}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="text-2xl">🎙️</div>
              <div className="p-2 bg-white/20 rounded-full animate-pulse">
                <Mic className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">Log Workout</h3>
              <p className="text-white/90 text-sm mb-3">Talk to log your sets & reps</p>
            </div>
            <Button 
              className="bg-white/20 hover:bg-white/30 text-white border-0 w-full text-sm font-medium transition-all duration-200 gap-1"
              onClick={(e) => {
                e.stopPropagation();
                onLogWorkout?.();
              }}
            >
              🎤 Start Logging
            </Button>
          </div>

          {/* Log Meal Card */}
          <div 
            className="relative bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-4 text-white cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 min-h-[120px] flex flex-col justify-between shadow-lg"
            onClick={onLogMeal}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="text-2xl">📷</div>
              <div className="p-2 bg-white/20 rounded-full">
                <Camera className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">Log Meal</h3>
              <p className="text-white text-sm mb-3">Snap a photo for instant nutrition</p>
            </div>
            <Button 
              className="bg-white/20 hover:bg-white/30 text-white border-0 w-full text-sm font-medium transition-all duration-200 gap-1"
              onClick={(e) => {
                e.stopPropagation();
                onLogMeal?.();
              }}
            >
              📸 Take Photo
            </Button>
          </div>

          {/* Manual Entry Card */}
          <div 
            className="relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl p-4 text-gray-800 dark:text-white cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 min-h-[120px] flex flex-col justify-between border border-gray-200 dark:border-gray-600 shadow-lg"
            onClick={onManualEntry}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="text-2xl">✍️</div>
              <div className="p-2 bg-gray-300/50 dark:bg-gray-600/50 rounded-full">
                <Edit className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">Manual Entry</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">Use keyboard to log manually</p>
            </div>
            <Button 
              variant="outline"
              className="bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 w-full text-sm font-medium transition-all duration-200 gap-1"
              onClick={(e) => {
                e.stopPropagation();
                onManualEntry?.();
              }}
            >
              ✏️ Enter Manually
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
