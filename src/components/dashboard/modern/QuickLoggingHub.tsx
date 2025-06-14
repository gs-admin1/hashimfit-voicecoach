
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickLoggingHubProps {
  onLogMeal: () => void;
  onLogWorkout: () => void;
  className?: string;
}

export function QuickLoggingHub({ onLogMeal, onLogWorkout, className }: QuickLoggingHubProps) {
  return (
    <Card className={cn("border-0 shadow-lg bg-white/80 backdrop-blur-sm", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center space-x-2">
          <span className="text-2xl">⚡</span>
          <span>Quick Log</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          onClick={onLogMeal}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 h-14 text-base font-semibold"
        >
          <Camera className="mr-3 h-5 w-5" />
          📸 Snap Your Meal
        </Button>
        
        <Button 
          onClick={onLogWorkout}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 h-14 text-base font-semibold"
        >
          <Mic className="mr-3 h-5 w-5" />
          🎙️ Voice Log Workout
        </Button>
      </CardContent>
    </Card>
  );
}
