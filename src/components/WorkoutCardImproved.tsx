
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  Dumbbell, 
  Play, 
  ChevronDown, 
  ChevronUp,
  MessageCircle,
  Zap,
  Target,
  TrendingUp,
  Flame,
  Star,
  Heart,
  Mic,
  MoreHorizontal,
  Save
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PreWorkoutModal } from "./PreWorkoutModal";
import { AICoachBubble } from "./AICoachBubble";
import { InteractiveExerciseList } from "./InteractiveExerciseList";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight: string;
  completed?: boolean;
  source?: 'planned' | 'voice';
  equipment?: string;
  bodyRegion?: string;
  tip?: string;
}

interface Workout {
  id: string;
  title: string;
  exercises: Exercise[];
  category?: string;
  estimatedDuration?: number;
  targetMuscles?: string[];
  difficulty?: number;
  aiGenerated?: boolean;
  streak?: number;
  isFavorite?: boolean;
  isCompleted?: boolean;
}

interface WorkoutCardImprovedProps {
  workout: Workout;
  onStart?: (workout: Workout, withAI?: boolean) => void;
  onEdit?: (workout: Workout) => void;
  onAskCoach?: () => void;
  onReplaceWorkout?: () => void;
  onSaveAsFavorite?: () => void;
  isToday?: boolean;
}

export function WorkoutCardImproved({ 
  workout, 
  onStart,
  onEdit,
  onAskCoach,
  onReplaceWorkout,
  onSaveAsFavorite,
  isToday = false
}: WorkoutCardImprovedProps) {
  const [showFullExercises, setShowFullExercises] = useState(false);
  const [showPreWorkoutModal, setShowPreWorkoutModal] = useState(false);
  const [voiceModeEnabled, setVoiceModeEnabled] = useState(false);
  const [showCoachBubble, setShowCoachBubble] = useState(isToday);

  // Calculate progress
  const completedExercises = workout.exercises.filter(ex => ex.completed).length;
  const totalExercises = workout.exercises.length;
  const progress = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

  // Get difficulty info
  const getDifficultyInfo = (difficulty?: number) => {
    if (!difficulty) return { label: "Intermediate", color: "bg-yellow-100 text-yellow-700", emoji: "🟡" };
    if (difficulty <= 2) return { label: "Beginner", color: "bg-green-100 text-green-700", emoji: "🟢" };
    if (difficulty <= 4) return { label: "Intermediate", color: "bg-yellow-100 text-yellow-700", emoji: "🟡" };
    return { label: "Advanced", color: "bg-red-100 text-red-700", emoji: "🔴" };
  };

  const difficultyInfo = getDifficultyInfo(workout.difficulty);

  // Get workout type from target muscles
  const getWorkoutType = () => {
    if (!workout.targetMuscles || workout.targetMuscles.length === 0) return "Full Body";
    if (workout.targetMuscles.length > 3) return "Full Body";
    return workout.targetMuscles.join(" & ");
  };

  // Get AI coach message
  const getAICoachMessage = () => {
    const messages = [
      `Today we're hitting ${getWorkoutType().toLowerCase()} — push for time under tension 🔥`,
      "Focus on form over speed today — your future self will thank you 💪",
      "Ready to crush this workout? Remember to breathe through each rep ⚡",
      "This session is all about consistency — let's build that momentum 🚀"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  // Add emoji to workout title
  const getWorkoutTitleWithEmoji = () => {
    const title = workout.title;
    if (title.toLowerCase().includes('pull') || title.toLowerCase().includes('back')) return `${title} 💪`;
    if (title.toLowerCase().includes('push') || title.toLowerCase().includes('chest')) return `${title} 🔥`;
    if (title.toLowerCase().includes('leg') || title.toLowerCase().includes('squat')) return `${title} 🦵`;
    if (title.toLowerCase().includes('core') || title.toLowerCase().includes('abs')) return `${title} ⚡`;
    if (title.toLowerCase().includes('cardio') || title.toLowerCase().includes('run')) return `${title} 🏃`;
    return `${title} 💯`;
  };

  const handleStartWorkout = (withAI = false) => {
    setShowPreWorkoutModal(false);
    onStart?.(workout, withAI);
  };

  const handleExerciseToggle = (exerciseId: string) => {
    // This would update the exercise completion status
    console.log('Toggle exercise:', exerciseId);
  };

  const handleEditWorkout = () => {
    onEdit?.(workout);
  };

  const handleToggleVoiceMode = () => {
    setVoiceModeEnabled(!voiceModeEnabled);
  };

  const handleSaveAsFavorite = () => {
    onSaveAsFavorite?.();
  };

  return (
    <>
      <Card className={cn(
        "w-full transition-all duration-300 hover:shadow-lg border-l-4 relative overflow-hidden",
        workout.isCompleted 
          ? "border-l-green-500 bg-green-50/30" 
          : "border-l-hashim-500",
        isToday && "ring-2 ring-hashim-300 ring-opacity-50"
      )}>
        {/* Animated pulse for today's workout */}
        {isToday && !workout.isCompleted && (
          <div className="absolute inset-0 bg-gradient-to-r from-hashim-500/5 to-purple-500/5 animate-pulse"></div>
        )}

        {/* AI Coach Bubble */}
        {showCoachBubble && isToday && !workout.isCompleted && (
          <div className="relative z-10">
            <AICoachBubble 
              message={getAICoachMessage()}
              isVisible={true}
              className="m-4 mb-0"
            />
          </div>
        )}

        {/* Top Section - Overview */}
        <CardHeader className="pb-3 relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className={cn(
                  "text-xl font-bold text-foreground",
                  isToday && "animate-pulse"
                )}>
                  {getWorkoutTitleWithEmoji()}
                </h3>
                <div className="flex items-center gap-1">
                  {workout.aiGenerated && (
                    <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 px-2 py-1">
                      <Zap size={10} className="mr-1" />
                      AI
                    </Badge>
                  )}
                  {workout.streak && workout.streak > 0 && (
                    <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 px-2 py-1">
                      <Flame size={10} className="mr-1" />
                      {workout.streak}
                    </Badge>
                  )}
                  {voiceModeEnabled && (
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 px-2 py-1">
                      <Mic size={10} className="mr-1" />
                      Voice
                    </Badge>
                  )}
                </div>
              </div>

              {/* Metadata Row */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                {workout.estimatedDuration && (
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{workout.estimatedDuration} min</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Target size={14} />
                  <span>{totalExercises} exercises</span>
                </div>
              </div>

              {/* Tags Row */}
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn("text-xs px-2 py-1", difficultyInfo.color)}>
                  {difficultyInfo.emoji} {difficultyInfo.label}
                </Badge>
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 px-2 py-1">
                  {getWorkoutType()}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              {workout.isFavorite && (
                <Star size={20} className="text-yellow-500 fill-current" />
              )}
              {workout.isCompleted && (
                <div className="flex items-center text-green-600">
                  <CheckCircle size={20} />
                  <TrendingUp size={16} className="ml-1" />
                </div>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleToggleVoiceMode}>
                    <Mic size={14} className="mr-2" />
                    {voiceModeEnabled ? "Disable" : "Enable"} Voice Mode
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSaveAsFavorite}>
                    <Heart size={14} className="mr-2" />
                    Save as Favorite
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleEditWorkout}>
                    <Save size={14} className="mr-2" />
                    Save as Template
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-4 relative z-10">
          {/* Interactive Exercise List */}
          {workout.exercises.length > 0 && (
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-muted-foreground">Workout Preview</h4>
                {totalExercises > 3 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFullExercises(!showFullExercises)}
                    className="h-6 px-2 text-xs"
                  >
                    {showFullExercises ? (
                      <>
                        <ChevronUp size={12} className="mr-1" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown size={12} className="mr-1" />
                        Show All
                      </>
                    )}
                  </Button>
                )}
              </div>

              <InteractiveExerciseList
                exercises={workout.exercises.slice(0, showFullExercises ? undefined : 3)}
                onExerciseToggle={handleExerciseToggle}
                showPreview={true}
              />

              {!showFullExercises && totalExercises > 3 && (
                <div className="text-center py-2 mt-3">
                  <span className="text-xs text-muted-foreground">
                    +{totalExercises - 3} more exercises
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Progress Section */}
          {!workout.isCompleted && totalExercises > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">Progress</span>
                <span className="font-semibold">
                  {completedExercises}/{totalExercises}
                </span>
              </div>
              <Progress 
                value={progress} 
                className="h-2"
              />
            </div>
          )}

          {/* Bottom CTA Section */}
          <div className="space-y-2 pt-2">
            {workout.isCompleted ? (
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => onStart?.(workout)}
                className="w-full text-green-600 border-green-200 hover:bg-green-50"
              >
                <TrendingUp size={16} className="mr-2" />
                View Results
              </Button>
            ) : (
              <Button 
                onClick={() => setShowPreWorkoutModal(true)}
                className="w-full bg-hashim-600 hover:bg-hashim-700 text-white"
                size="lg"
              >
                <Play size={16} className="mr-2" />
                Start Workout
              </Button>
            )}

            {/* Secondary CTAs */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onAskCoach}
                className="flex-1 text-muted-foreground hover:text-foreground sticky bottom-4 z-50"
              >
                <MessageCircle size={14} className="mr-1" />
                Ask Coach
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onReplaceWorkout}
                className="flex-1 text-muted-foreground hover:text-foreground"
              >
                <Dumbbell size={14} className="mr-1" />
                Replace
              </Button>
            </div>
          </div>

          {/* Empty State */}
          {workout.exercises.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Dumbbell className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No exercises in this workout</p>
              <p className="text-xs mt-1">Add exercises to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pre-Workout Modal */}
      <PreWorkoutModal
        isOpen={showPreWorkoutModal}
        onClose={() => setShowPreWorkoutModal(false)}
        onStartWorkout={handleStartWorkout}
        workout={{
          title: workout.title,
          estimatedDuration: workout.estimatedDuration || 45,
          exercises: workout.exercises,
          difficulty: workout.difficulty,
          targetMuscles: workout.targetMuscles
        }}
      />
    </>
  );
}
