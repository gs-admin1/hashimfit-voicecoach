
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { 
  Play, 
  Pause, 
  CheckCircle, 
  Clock, 
  Dumbbell,
  Heart,
  RotateCcw,
  Star,
  StarOff,
  GripVertical
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight: string;
  completed?: number;
  rpe?: number;
}

interface WorkoutSessionCardProps {
  workout: {
    id: string;
    title: string;
    exercises: Exercise[];
    category: string;
  };
  onComplete?: () => void;
  onSaveAsFavorite?: () => void;
  className?: string;
}

export function WorkoutSessionCard({ 
  workout, 
  onComplete, 
  onSaveAsFavorite,
  className 
}: WorkoutSessionCardProps) {
  const [currentExercise, setCurrentExercise] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [exercises, setExercises] = useState(workout.exercises);
  
  const currentEx = exercises[currentExercise];
  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets, 0);
  const completedSets = exercises.reduce((acc, ex) => acc + (ex.completed || 0), 0);
  const progress = (completedSets / totalSets) * 100;

  const startRestTimer = (duration = 60) => {
    setRestTimer(duration);
    setIsResting(true);
    const interval = setInterval(() => {
      setRestTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsResting(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const completeSet = () => {
    const updatedExercises = [...exercises];
    updatedExercises[currentExercise].completed = (updatedExercises[currentExercise].completed || 0) + 1;
    setExercises(updatedExercises);
    
    if (currentSet < currentEx.sets) {
      setCurrentSet(currentSet + 1);
      startRestTimer();
    } else if (currentExercise < exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
      setCurrentSet(1);
      startRestTimer(90);
    } else {
      onComplete?.();
    }
  };

  const updateRPE = (exerciseIndex: number, rpe: number) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].rpe = rpe;
    setExercises(updatedExercises);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    onSaveAsFavorite?.();
  };

  return (
    <Card className={cn("transition-all duration-300", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-hashim-100 rounded-lg">
              <Dumbbell className="h-4 w-4 text-hashim-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{workout.title}</CardTitle>
              <Badge variant="secondary" className="mt-1">
                {workout.category}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFavorite}
            className="h-8 w-8 p-0"
          >
            {isFavorite ? 
              <Star className="h-4 w-4 text-yellow-500 fill-current" /> : 
              <StarOff className="h-4 w-4" />
            }
          </Button>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{completedSets}/{totalSets} sets</span>
          </div>
          <div className="relative">
            <Progress value={progress} className="h-2" />
            <div 
              className="absolute top-0 h-2 bg-gradient-to-r from-hashim-400 to-hashim-600 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Exercise */}
        <div className="p-4 bg-hashim-50 rounded-lg border-2 border-hashim-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-lg">{currentEx.name}</h3>
            <Badge variant="outline">
              Exercise {currentExercise + 1}/{exercises.length}
            </Badge>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Set</p>
              <p className="text-xl font-bold text-hashim-600">{currentSet}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Reps</p>
              <Input 
                type="text" 
                defaultValue={currentEx.reps}
                className="text-center font-bold h-8"
              />
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Weight</p>
              <Input 
                type="text" 
                defaultValue={currentEx.weight}
                className="text-center font-bold h-8"
              />
            </div>
          </div>
          
          {/* RPE Selector */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">Rate of Perceived Exertion (RPE)</p>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rpe) => (
                <Button
                  key={rpe}
                  variant={currentEx.rpe === rpe ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "w-8 h-8 p-0 text-xs",
                    rpe <= 3 && "border-green-300 text-green-600",
                    rpe > 3 && rpe <= 6 && "border-yellow-300 text-yellow-600",
                    rpe > 6 && rpe <= 8 && "border-orange-300 text-orange-600",
                    rpe > 8 && "border-red-300 text-red-600"
                  )}
                  onClick={() => updateRPE(currentExercise, rpe)}
                >
                  {rpe}
                </Button>
              ))}
            </div>
          </div>
          
          {isResting ? (
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Clock className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold text-blue-600">{restTimer}s</p>
              <p className="text-sm text-muted-foreground">Rest time</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsResting(false)}
                className="mt-2"
              >
                Skip Rest
              </Button>
            </div>
          ) : (
            <Button 
              onClick={completeSet}
              className="w-full bg-hashim-600 hover:bg-hashim-700"
              size="lg"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Complete Set {currentSet}
            </Button>
          )}
        </div>
        
        {/* Exercise List */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">All Exercises</h4>
          {exercises.map((exercise, index) => (
            <div 
              key={exercise.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border transition-all",
                index === currentExercise ? "bg-hashim-100 border-hashim-300" : "bg-gray-50 border-gray-200",
                index < currentExercise && "opacity-60"
              )}
            >
              <div className="flex items-center space-x-3">
                <GripVertical className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="font-medium">{exercise.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {exercise.sets} sets × {exercise.reps} reps
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {exercise.completed && (
                  <Badge variant="secondary" className="text-xs">
                    {exercise.completed}/{exercise.sets}
                  </Badge>
                )}
                {index < currentExercise && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
