
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Plus, Clock, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroCTACardProps {
  workout?: any;
  onStartWorkout: () => void;
  onAddWorkout: () => void;
  isLoading?: boolean;
  className?: string;
}

export function HeroCTACard({ 
  workout, 
  onStartWorkout, 
  onAddWorkout, 
  isLoading, 
  className 
}: HeroCTACardProps) {
  if (isLoading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardContent className="p-6">
          <div className="h-24 bg-gray-200 rounded-lg"></div>
        </CardContent>
      </Card>
    );
  }

  if (!workout) {
    return (
      <Card className={cn("bg-gradient-to-br from-orange-500 to-red-500 text-white border-0 shadow-xl", className)}>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-4xl mb-3">🎯</div>
            <h2 className="text-xl font-bold mb-2">No Workout Planned</h2>
            <p className="text-white/90 mb-4">Let's get you moving today!</p>
            <Button 
              onClick={onAddWorkout}
              className="bg-white/20 hover:bg-white/30 text-white border-0 w-full font-semibold"
              size="lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add Today's Workout
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "bg-gradient-to-br from-emerald-500 to-blue-600 text-white border-0 shadow-xl transform transition-all duration-300 hover:scale-[1.02]",
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Flame className="h-5 w-5 text-orange-300" />
              <span className="text-sm font-medium text-white/80">Today's Challenge</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">{workout.title}</h2>
            <div className="flex items-center space-x-4 text-white/90">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{workout.estimatedDuration || 45} min</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-sm">{workout.exercises?.length || 0} exercises</span>
              </div>
            </div>
          </div>
          <div className="text-4xl">
            {workout.is_completed ? '✅' : '💪'}
          </div>
        </div>

        {workout.is_completed ? (
          <div className="text-center p-4 bg-white/10 rounded-lg">
            <h3 className="font-semibold mb-1">Workout Completed! 🎉</h3>
            <p className="text-sm text-white/80">Amazing work today, champion!</p>
          </div>
        ) : (
          <Button 
            onClick={onStartWorkout}
            className="bg-white text-emerald-600 hover:bg-white/90 w-full font-bold text-lg py-3"
            size="lg"
          >
            <Play className="mr-2 h-5 w-5" />
            Start Workout Now
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
