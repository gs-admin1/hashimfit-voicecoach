
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
  Save,
  Lightbulb,
  ArrowUpDown,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PreWorkoutModalEnhanced } from "./PreWorkoutModalEnhanced";
import { AICoachBubble } from "./AICoachBubble";
import { InteractiveExerciseList } from "./InteractiveExerciseList";
import { LiveProgressFeedback } from "./LiveProgressFeedback";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  onStart?: (workout: Workout, options?: { withAI?: boolean; voiceMode?: boolean }) => void;
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
    if (!difficulty) return { label: "Intermediate", color: "bg-yellow-100 text-yellow-700", emoji: "🟡", bar: "bg-yellow-400" };
    if (difficulty <= 3) return { label: "Easy", color: "bg-green-100 text-green-700", emoji: "🟢", bar: "bg-green-400" };
    if (difficulty <= 6) return { label: "Intermediate", color: "bg-yellow-100 text-yellow-700", emoji: "🟡", bar: "bg-yellow-400" };
    return { label: "Hard", color: "bg-red-100 text-red-700", emoji: "🔴", bar: "bg-red-400" };
  };

  const difficultyInfo = getDifficultyInfo(workout.difficulty);

  // Get workout type from target muscles
  const getWorkoutType = () => {
    if (!workout.targetMuscles || workout.targetMuscles.length === 0) return "Full Body";
    if (workout.targetMuscles.length > 3) return "Full Body";
    return workout.targetMuscles.join(" & ");
  };

  // Add emoji to workout title
  const getWorkoutTitleWithEmoji = () => {
    const title = workout.title;
    if (title.toLowerCase().includes('pull') || title.toLowerCase().includes('back')) return `Pull & Core Day 💪`;
    if (title.toLowerCase().includes('push') || title.toLowerCase().includes('chest')) return `${title} 🔥`;
    if (title.toLowerCase().includes('leg') || title.toLowerCase().includes('squat')) return `${title} 🦵`;
    if (title.toLowerCase().includes('core') || title.toLowerCase().includes('abs')) return `${title} ⚡`;
    if (title.toLowerCase().includes('cardio') || title.toLowerCase().includes('run')) return `${title} 🏃`;
    return `${title} 💯`;
  };

  const handleStartWorkout = (options: { withAI: boolean; voiceMode: boolean }) => {
    setShowPreWorkoutModal(false);
    onStart?.(workout, options);
  };

  const handleExerciseToggle = (exerciseId: string) => {
    console.log('Toggle exercise:', exerciseId);
  };

  const handleExerciseModify = (exerciseId: string, type: 'sets' | 'reps' | 'weight') => {
    console.log('Modify exercise:', exerciseId, type);
  };

  const handleExerciseSwap = (exerciseId: string) => {
    console.log('Swap exercise:', exerciseId);
  };

  const getFormTip = (exerciseName: string) => {
    const tips: Record<string, string> = {
      'squat': 'Add weight by using a backpack or jug of water 💡',
      'pushup': 'Try incline pushups against a wall or chair if too challenging 💪',
      'lunge': 'Hold the bottom position for 2 seconds for more muscle activation ⚡',
      'plank': 'Focus on keeping your core tight and breathing steady 🔥'
    };
    
    const exerciseKey = Object.keys(tips).find(key => 
      exerciseName.toLowerCase().includes(key)
    );
    
    return exerciseKey ? tips[exerciseKey] : 'Focus on controlled movement and proper form 💯';
  };

  return (
    <TooltipProvider>
      <Card className={cn(
        "w-full transition-all duration-300 hover:shadow-lg border-l-4 relative overflow-hidden",
        workout.isCompleted 
          ? "border-l-green-500 bg-green-50/30" 
          : "border-l-hashim-500",
        isToday && "ring-2 ring-hashim-300 ring-opacity-50 shadow-lg"
      )}>
        {/* Difficulty Color Bar */}
        <div className={cn("absolute top-0 left-0 right-0 h-1", difficultyInfo.bar)}></div>

        {/* Animated pulse for today's workout */}
        {isToday && !workout.isCompleted && (
          <div className="absolute inset-0 bg-gradient-to-r from-hashim-500/5 to-purple-500/5 animate-pulse"></div>
        )}

        {/* AI Coach Bubble */}
        {showCoachBubble && isToday && !workout.isCompleted && (
          <div className="relative z-10">
            <AICoachBubble 
              message="Focus on controlled movement — quality over speed today! 💪"
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
                      ✨ AI
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
                    <span>⏱ {workout.estimatedDuration} min</span>
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
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100">
                    <MoreHorizontal size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setVoiceModeEnabled(!voiceModeEnabled)}>
                    <Mic size={14} className="mr-2" />
                    {voiceModeEnabled ? "Disable" : "Enable"} Voice Mode
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onSaveAsFavorite}>
                    <Heart size={14} className="mr-2" />
                    Save as Favorite
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onEdit}>
                    <Save size={14} className="mr-2" />
                    Save as Template
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-4 relative z-10">
          {/* Enhanced Exercise List */}
          {workout.exercises.length > 0 && (
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-muted-foreground">Exercise Preview</h4>
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                        <Lightbulb size={12} className="mr-1" />
                        Form Guide
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View exercise form tips and modifications</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  {totalExercises > 3 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFullExercises(!showFullExercises)}
                      className="h-6 px-2 text-xs hover:bg-gray-100"
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
              </div>

              {/* Enhanced Exercise Items */}
              <div className="space-y-2">
                {(showFullExercises ? workout.exercises : workout.exercises.slice(0, 3)).map((exercise, index) => (
                  <div 
                    key={exercise.id}
                    className="flex items-center justify-between p-2 bg-white rounded border hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleExerciseToggle(exercise.id)}
                        className={cn(
                          "w-5 h-5 rounded border-2 flex items-center justify-center transition-all hover:scale-105",
                          exercise.completed 
                            ? "bg-green-500 border-green-500" 
                            : "border-gray-300 hover:border-green-400"
                        )}
                      >
                        {exercise.completed && <CheckCircle className="w-3 h-3 text-white" />}
                      </button>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-sm font-medium",
                            exercise.completed && "line-through text-muted-foreground"
                          )}>
                            {exercise.name}
                          </span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info size={12} className="text-blue-500 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="text-xs">{getFormTip(exercise.name)}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {exercise.sets} sets × {exercise.reps} reps
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0"
                            onClick={() => handleExerciseModify(exercise.id, 'sets')}
                          >
                            <ArrowUpDown size={10} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Modify sets/reps</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      <span className="text-xs text-muted-foreground ml-1">
                        {exercise.weight}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {!showFullExercises && totalExercises > 3 && (
                <div className="text-center py-2 mt-3">
                  <span className="text-xs text-muted-foreground">
                    +{totalExercises - 3} more exercises
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Live Progress Feedback - shown when workout is in progress */}
          {!workout.isCompleted && completedExercises > 0 && (
            <LiveProgressFeedback
              completedExercises={completedExercises}
              totalExercises={totalExercises}
              onAskCoach={onAskCoach}
            />
          )}

          {/* Static Progress Section - shown when no exercises completed yet */}
          {!workout.isCompleted && completedExercises === 0 && totalExercises > 0 && (
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
                className="w-full text-green-600 border-green-200 hover:bg-green-50 transition-colors"
              >
                <TrendingUp size={16} className="mr-2" />
                View Results
              </Button>
            ) : (
              <Button 
                onClick={() => setShowPreWorkoutModal(true)}
                className="w-full bg-hashim-600 hover:bg-hashim-700 text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                size="lg"
              >
                <Play size={16} className="mr-2" />
                Start Workout
              </Button>
            )}

            {/* Secondary CTAs */}
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onAskCoach}
                    className="flex-1 text-muted-foreground hover:text-foreground transition-colors hover:bg-purple-50"
                  >
                    <MessageCircle size={14} className="mr-1" />
                    Ask Coach
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Need help with form, pacing, or alternatives?</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onReplaceWorkout}
                    className="flex-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Dumbbell size={14} className="mr-1" />
                    Replace
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Replace entire session or individual exercises</p>
                </TooltipContent>
              </Tooltip>
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

      {/* Enhanced Pre-Workout Modal */}
      <PreWorkoutModalEnhanced
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
    </TooltipProvider>
  );
}
