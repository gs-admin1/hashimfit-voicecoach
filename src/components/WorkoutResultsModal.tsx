
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Clock, 
  Calendar, 
  Target, 
  CheckCircle, 
  XCircle, 
  Flame, 
  TrendingUp, 
  MessageCircle,
  History,
  Repeat,
  Settings,
  Trophy,
  Zap
} from "lucide-react";
import { format } from "date-fns";

interface WorkoutResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  workout: {
    id: string;
    title: string;
    category: string;
    exercises: Array<{
      id: string;
      name: string;
      sets: number;
      reps: string;
      weight: string;
      completed: boolean;
      actualSets?: number;
      actualReps?: string;
      actualWeight?: string;
      restTime?: number;
      notes?: string;
    }>;
    isCompleted: boolean;
    scheduledDate: string;
    estimatedDuration: number;
    actualDuration?: number;
    caloriesBurned?: number;
    completionDate?: string;
    aiModifications?: boolean;
    intensityLevel?: number;
    workout_log_id?: string;
  };
  onRepeatWorkout?: () => void;
  onCustomizePlan?: () => void;
  onViewHistory?: () => void;
  onAskCoach?: () => void;
}

export function WorkoutResultsModal({
  isOpen,
  onClose,
  workout,
  onRepeatWorkout,
  onCustomizePlan,
  onViewHistory,
  onAskCoach
}: WorkoutResultsModalProps) {
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  const completedExercises = workout.exercises.filter(ex => ex.completed).length;
  const totalExercises = workout.exercises.length;
  const completionPercentage = (completedExercises / totalExercises) * 100;

  const getIntensityBadge = (level?: number) => {
    if (!level) return null;
    
    const badges = {
      1: { emoji: "😴", label: "Light", color: "bg-green-100 text-green-700" },
      2: { emoji: "🚶", label: "Easy", color: "bg-green-100 text-green-700" },
      3: { emoji: "🏃", label: "Moderate", color: "bg-yellow-100 text-yellow-700" },
      4: { emoji: "💪", label: "Hard", color: "bg-orange-100 text-orange-700" },
      5: { emoji: "🔥", label: "Intense", color: "bg-red-100 text-red-700" }
    };
    
    const badge = badges[level as keyof typeof badges];
    return badge ? (
      <Badge className={`${badge.color} border-0`}>
        {badge.emoji} {badge.label}
      </Badge>
    ) : null;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-4">
          <DialogTitle className="text-xl font-bold text-hashim-900">
            {workout.title}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Workout completed on {format(new Date(workout.completionDate || workout.scheduledDate), "MMM d, yyyy")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Workout Overview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Target className="h-5 w-5 mr-2 text-hashim-600" />
                Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Duration</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDuration(workout.actualDuration || workout.estimatedDuration)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Completed</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(workout.completionDate || workout.scheduledDate), "h:mm a")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Exercises Completed</span>
                  <span className="font-medium">{completedExercises}/{totalExercises}</span>
                </div>
                <Progress value={completionPercentage} className="h-2" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getIntensityBadge(workout.intensityLevel)}
                  {workout.aiModifications && (
                    <Badge variant="outline" className="text-xs">
                      <Zap className="h-3 w-3 mr-1" />
                      AI Enhanced
                    </Badge>
                  )}
                </div>
                {workout.caloriesBurned && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Flame className="h-4 w-4 mr-1" />
                    {workout.caloriesBurned} cal
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Exercise Breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-hashim-600" />
                Exercise Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {workout.exercises.map((exercise, index) => (
                <div key={exercise.id} className="space-y-2">
                  <div 
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => setExpandedExercise(
                      expandedExercise === exercise.id ? null : exercise.id
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      {exercise.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{exercise.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {exercise.actualSets || exercise.sets} sets × {exercise.actualReps || exercise.reps}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{exercise.actualWeight || exercise.weight}</p>
                    </div>
                  </div>

                  {expandedExercise === exercise.id && (
                    <div className="ml-8 p-3 bg-white rounded border text-sm space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Planned:</span>
                          <p>{exercise.sets} × {exercise.reps} @ {exercise.weight}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Actual:</span>
                          <p>{exercise.actualSets || exercise.sets} × {exercise.actualReps || exercise.reps} @ {exercise.actualWeight || exercise.weight}</p>
                        </div>
                      </div>
                      {exercise.restTime && (
                        <p className="text-xs text-muted-foreground">
                          Rest: {exercise.restTime}s
                        </p>
                      )}
                      {exercise.notes && (
                        <p className="text-xs text-muted-foreground">
                          Notes: {exercise.notes}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {index < workout.exercises.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Performance Highlights */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-hashim-600" />
                Performance Highlights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-green-50">
                  <p className="text-lg font-bold text-green-700">{completionPercentage.toFixed(0)}%</p>
                  <p className="text-xs text-green-600">Completion Rate</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-blue-50">
                  <p className="text-lg font-bold text-blue-700">
                    {workout.actualDuration || workout.estimatedDuration}m
                  </p>
                  <p className="text-xs text-blue-600">Total Time</p>
                </div>
              </div>
              
              {completionPercentage === 100 && (
                <div className="text-center py-2">
                  <Badge className="bg-gold-100 text-gold-700 border-gold-200">
                    🏆 Perfect Session!
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Coaching Insights */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-hashim-600" />
                Coaching Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {completionPercentage === 100 
                  ? "Excellent work! You completed all exercises as planned. Consider increasing intensity next time."
                  : `Good effort! You completed ${completedExercises} of ${totalExercises} exercises. Focus on consistency for better results.`
                }
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={onAskCoach}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                🧠 Ask Coach for Personalized Feedback
              </Button>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={onViewHistory}>
                <History className="h-4 w-4 mr-2" />
                📈 View History
              </Button>
              <Button variant="outline" onClick={onRepeatWorkout}>
                <Repeat className="h-4 w-4 mr-2" />
                🔁 Repeat Workout
              </Button>
            </div>
            <Button variant="outline" className="w-full" onClick={onCustomizePlan}>
              <Settings className="h-4 w-4 mr-2" />
              🧩 Customize Plan
            </Button>
            <Button onClick={onClose} className="w-full bg-hashim-600 hover:bg-hashim-700">
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
