
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
      <CardContent className="p-5">
        <div className="grid grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center px-4 py-6 h-24 space-y-2 hover:bg-hashim-50 hover:border-hashim-300 transition-all duration-200"
            onClick={onLogWorkout}
          >
            <Mic className="h-5 w-5 text-hashim-600" />
            <span className="text-xs font-medium text-center leading-tight">Log Workout</span>
          </Button>
          
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center px-4 py-6 h-24 space-y-2 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
            onClick={onLogMeal}
          >
            <Camera className="h-5 w-5 text-green-600" />
            <span className="text-xs font-medium text-center leading-tight">Log Meal</span>
          </Button>
          
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center px-4 py-6 h-24 space-y-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
            onClick={onManualEntry}
          >
            <Edit className="h-5 w-5 text-blue-600" />
            <span className="text-xs font-medium text-center leading-tight">Manual Entry</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
