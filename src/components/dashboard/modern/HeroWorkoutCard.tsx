
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Plus, Loader2, Zap } from "lucide-react";

interface HeroWorkoutCardProps {
  workout?: any;
  onStartWorkout: () => void;
  onAddWorkout: () => void;
  onGenerateWorkout: () => void;
  isLoading?: boolean;
}

export function HeroWorkoutCard({ workout, onStartWorkout, onAddWorkout, onGenerateWorkout, isLoading }: HeroWorkoutCardProps) {
  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 border-0 shadow-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-white animate-spin mr-3" />
            <span className="text-white text-lg font-medium">Loading your workout...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!workout) {
    return (
      <Card className="bg-gradient-to-r from-slate-700 to-slate-800 border-0 shadow-2xl overflow-hidden">
        <CardContent className="p-6 relative">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.1),transparent)]" />
          
          <div className="relative text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <Plus className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Your Next Workout
            </h3>
            <p className="text-white/80 mb-6 text-lg">
              Ready to get started? Let's build something amazing!
            </p>
            
            <div className="flex flex-col space-y-3">
              <Button 
                onClick={onAddWorkout}
                size="lg"
                className="bg-white text-slate-800 hover:bg-white/90 font-bold py-4 text-lg shadow-lg transform transition-all duration-200 hover:scale-105"
              >
                <Plus className="h-6 w-6 mr-2" />
                Choose Workout
              </Button>
              
              <Button 
                onClick={onGenerateWorkout}
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 font-semibold py-4 backdrop-blur-sm"
              >
                <Zap className="h-5 w-5 mr-2" />
                AI Generate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const completedExercises = workout.exercises?.filter((ex: any) => ex.completed).length || 0;
  const totalExercises = workout.exercises?.length || 0;
  const progress = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;
  const hasStarted = completedExercises > 0;

  return (
    <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 border-0 shadow-2xl overflow-hidden">
      <CardContent className="p-6 relative">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.1),transparent)]" />
        
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <span className="text-white/80 text-sm font-medium bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                  TODAY'S WORKOUT
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">
                {workout.title}
              </h3>
              <p className="text-white/90 text-sm">
                {totalExercises} exercises • {workout.estimatedDuration || 45} min
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Play className="h-8 w-8 text-white" />
            </div>
          </div>

          {/* Progress Bar (if started) */}
          {hasStarted && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-white/80 mb-2">
                <span>Progress</span>
                <span>{completedExercises}/{totalExercises} complete</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3 backdrop-blur-sm">
                <div 
                  className="bg-white h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          
          <Button 
            onClick={onStartWorkout}
            size="lg"
            className="w-full bg-white text-blue-600 hover:bg-white/90 font-bold py-4 text-lg shadow-lg transform transition-all duration-200 hover:scale-105"
          >
            <Play className="h-6 w-6 mr-2" />
            {hasStarted ? 'Continue Workout' : 'Start Workout'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
