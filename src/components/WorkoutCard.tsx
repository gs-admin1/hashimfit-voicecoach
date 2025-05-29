
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
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
  Edit3,
  GripVertical,
  Plus,
  Minus,
  RotateCcw,
  Save,
  Link,
  Unlink,
  Eye,
  EyeOff
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { EnhancedWorkoutSessionCard } from "./EnhancedWorkoutSessionCard";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight: string;
  completed?: boolean;
  source?: 'planned' | 'voice';
  rest_seconds?: number;
  superset_group_id?: string;
  position_in_workout?: number;
}

interface Workout {
  id: string;
  title: string;
  exercises: Exercise[];
  is_completed?: boolean;
  schedule_id?: string;
  workout_log_id?: string;
  category?: string;
  estimatedDuration?: number;
  targetMuscles?: string[];
  difficulty?: number;
  aiGenerated?: boolean;
  streak?: number;
}

interface WorkoutCardProps {
  workout: Workout;
  onExerciseComplete?: (exerciseId: string, completed: boolean) => void;
  isSessionMode?: boolean;
  onStart?: (workout: Workout) => void;
  onAskCoach?: () => void;
  onReplaceWorkout?: () => void;
  onUpdateWorkout?: (updatedWorkout: Workout) => void;
}

export function WorkoutCard({ 
  workout, 
  onExerciseComplete, 
  isSessionMode = false,
  onStart,
  onAskCoach,
  onReplaceWorkout,
  onUpdateWorkout 
}: WorkoutCardProps) {
  const [showFullExercises, setShowFullExercises] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedWorkout, setEditedWorkout] = useState<Workout>(workout);
  const [originalWorkout, setOriginalWorkout] = useState<Workout>(workout);
  const [editHistory, setEditHistory] = useState<Workout[]>([workout]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // If in session mode, use the enhanced session card
  if (isSessionMode) {
    const sessionWorkout = {
      id: workout.id,
      title: workout.title,
      exercises: workout.exercises.map((ex, index) => ({
        ...ex,
        completed: ex.completed ? 1 : 0,
        rest_seconds: 60,
        position_in_workout: index,
        originalData: {
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
          rest_seconds: 60
        }
      })),
      category: workout.category || 'strength',
      workout_log_id: workout.workout_log_id
    };

    return (
      <EnhancedWorkoutSessionCard 
        workout={sessionWorkout}
        onComplete={() => {}}
        onSaveAsFavorite={() => {}}
        onStartRestTimer={() => {}}
      />
    );
  }

  // Save current state to history for undo
  const saveToHistory = useCallback((newWorkout: Workout) => {
    const newHistory = editHistory.slice(0, historyIndex + 1);
    newHistory.push(newWorkout);
    setEditHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [editHistory, historyIndex]);

  // Handle drag end for reordering exercises
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(editedWorkout.exercises);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedWorkout = {
      ...editedWorkout,
      exercises: items.map((ex, index) => ({
        ...ex,
        position_in_workout: index
      }))
    };

    setEditedWorkout(updatedWorkout);
    saveToHistory(updatedWorkout);
  };

  // Update exercise parameter
  const updateExercise = (exerciseId: string, field: string, value: any) => {
    const updatedExercises = editedWorkout.exercises.map(ex =>
      ex.id === exerciseId ? { ...ex, [field]: value } : ex
    );

    const updatedWorkout = {
      ...editedWorkout,
      exercises: updatedExercises
    };

    setEditedWorkout(updatedWorkout);
    saveToHistory(updatedWorkout);
  };

  // Toggle superset grouping
  const toggleSuperset = (exerciseIds: string[]) => {
    const groupId = exerciseIds.length > 1 ? `superset-${Date.now()}` : undefined;
    
    const updatedExercises = editedWorkout.exercises.map(ex =>
      exerciseIds.includes(ex.id) 
        ? { ...ex, superset_group_id: groupId }
        : ex
    );

    const updatedWorkout = {
      ...editedWorkout,
      exercises: updatedExercises
    };

    setEditedWorkout(updatedWorkout);
    saveToHistory(updatedWorkout);
  };

  // Undo last change
  const undo = () => {
    if (historyIndex > 0) {
      const previousState = editHistory[historyIndex - 1];
      setEditedWorkout(previousState);
      setHistoryIndex(historyIndex - 1);
    }
  };

  // Reset to original
  const resetToOriginal = () => {
    setEditedWorkout(originalWorkout);
    setEditHistory([originalWorkout]);
    setHistoryIndex(0);
  };

  // Save changes and exit edit mode
  const saveChanges = () => {
    onUpdateWorkout?.(editedWorkout);
    setOriginalWorkout(editedWorkout);
    setIsEditMode(false);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditedWorkout(originalWorkout);
    setIsEditMode(false);
  };

  // Check if exercise has been modified
  const isExerciseModified = (exercise: Exercise) => {
    const original = originalWorkout.exercises.find(ex => ex.id === exercise.id);
    if (!original) return true;
    
    return (
      original.sets !== exercise.sets ||
      original.reps !== exercise.reps ||
      original.weight !== exercise.weight ||
      original.rest_seconds !== exercise.rest_seconds ||
      original.superset_group_id !== exercise.superset_group_id
    );
  };

  // Calculate progress
  const currentWorkout = isEditMode ? editedWorkout : workout;
  const completedExercises = currentWorkout.exercises.filter(ex => ex.completed).length;
  const totalExercises = currentWorkout.exercises.length;
  const progress = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

  // Get difficulty info
  const getDifficultyInfo = (difficulty?: number) => {
    if (!difficulty) return { label: "Intermediate", color: "bg-yellow-100 text-yellow-700" };
    if (difficulty <= 2) return { label: "Beginner", color: "bg-green-100 text-green-700" };
    if (difficulty <= 4) return { label: "Intermediate", color: "bg-yellow-100 text-yellow-700" };
    return { label: "Advanced", color: "bg-red-100 text-red-700" };
  };

  const difficultyInfo = getDifficultyInfo(currentWorkout.difficulty);

  // Get workout type from target muscles
  const getWorkoutType = () => {
    if (!currentWorkout.targetMuscles || currentWorkout.targetMuscles.length === 0) return "Full Body";
    if (currentWorkout.targetMuscles.length > 3) return "Full Body";
    return currentWorkout.targetMuscles.join(" & ");
  };

  return (
    <Card className={cn(
      "w-full transition-all duration-300 hover:shadow-lg border-l-4",
      currentWorkout.is_completed 
        ? "border-l-green-500 bg-green-50/30" 
        : "border-l-hashim-500"
    )}>
      {/* Top Section - Overview */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold text-foreground">{currentWorkout.title}</h3>
              <div className="flex items-center gap-1">
                {currentWorkout.aiGenerated && (
                  <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 px-2 py-1">
                    <Zap size={10} className="mr-1" />
                    AI
                  </Badge>
                )}
                {currentWorkout.streak && currentWorkout.streak > 0 && (
                  <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 px-2 py-1">
                    <Flame size={10} className="mr-1" />
                    {currentWorkout.streak}
                  </Badge>
                )}
                {isEditMode && (
                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 px-2 py-1">
                    <Edit3 size={10} className="mr-1" />
                    Editing
                  </Badge>
                )}
              </div>
            </div>

            {/* Metadata Row */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
              {currentWorkout.estimatedDuration && (
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{currentWorkout.estimatedDuration} min</span>
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
                {difficultyInfo.label}
              </Badge>
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 px-2 py-1">
                {getWorkoutType()}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            {!currentWorkout.is_completed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (isEditMode) {
                    setIsEditMode(false);
                  } else {
                    setIsEditMode(true);
                    setShowFullExercises(true);
                  }
                }}
                className="h-8 px-2"
              >
                {isEditMode ? <EyeOff size={14} /> : <Edit3 size={14} />}
              </Button>
            )}
            {currentWorkout.is_completed && (
              <div className="flex items-center text-green-600">
                <CheckCircle size={20} />
                <TrendingUp size={16} className="ml-1" />
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Edit Mode Controls */}
        {isEditMode && (
          <div className="bg-blue-50 rounded-lg p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-800">Edit Mode</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={undo}
                  disabled={historyIndex === 0}
                  className="h-6 px-2 text-xs"
                >
                  <RotateCcw size={12} className="mr-1" />
                  Undo
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetToOriginal}
                  className="h-6 px-2 text-xs text-orange-600"
                >
                  Reset
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={cancelEditing}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={saveChanges}
                className="flex-1 bg-hashim-600 hover:bg-hashim-700 text-white"
              >
                <Save size={14} className="mr-1" />
                Save Changes
              </Button>
            </div>
          </div>
        )}

        {/* Exercise Preview/Edit Section */}
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              {isEditMode ? "Edit Exercises" : "Workout Preview"}
            </h4>
            {totalExercises > 3 && !isEditMode && (
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

          {isEditMode ? (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="exercises">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                    {currentWorkout.exercises.map((exercise, index) => (
                      <Draggable key={exercise.id} draggableId={exercise.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={cn(
                              "bg-white rounded-lg border p-3 space-y-3 transition-all",
                              snapshot.isDragging && "shadow-lg rotate-1",
                              isExerciseModified(exercise) && "ring-2 ring-blue-200 bg-blue-50/50"
                            )}
                          >
                            {/* Exercise Header */}
                            <div className="flex items-center gap-2">
                              <div {...provided.dragHandleProps} className="cursor-grab">
                                <GripVertical size={16} className="text-gray-400" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{exercise.name}</p>
                                  {isExerciseModified(exercise) && (
                                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                      Modified
                                    </Badge>
                                  )}
                                  {exercise.superset_group_id && (
                                    <Badge variant="outline" className="text-xs">
                                      <Link size={10} className="mr-1" />
                                      Superset
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Exercise Parameters */}
                            <div className="grid grid-cols-4 gap-2">
                              <div className="text-center">
                                <label className="text-xs text-muted-foreground block mb-1">Sets</label>
                                <div className="flex items-center">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => updateExercise(exercise.id, 'sets', Math.max(1, exercise.sets - 1))}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Minus size={12} />
                                  </Button>
                                  <Input
                                    type="number"
                                    value={exercise.sets}
                                    onChange={(e) => updateExercise(exercise.id, 'sets', parseInt(e.target.value) || 1)}
                                    className="h-6 text-center border-0 text-sm font-medium mx-1"
                                    min="1"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => updateExercise(exercise.id, 'sets', exercise.sets + 1)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Plus size={12} />
                                  </Button>
                                </div>
                              </div>

                              <div className="text-center">
                                <label className="text-xs text-muted-foreground block mb-1">Reps</label>
                                <Input
                                  type="text"
                                  value={exercise.reps}
                                  onChange={(e) => updateExercise(exercise.id, 'reps', e.target.value)}
                                  className="h-6 text-center text-sm font-medium"
                                />
                              </div>

                              <div className="text-center">
                                <label className="text-xs text-muted-foreground block mb-1">Weight</label>
                                <Input
                                  type="text"
                                  value={exercise.weight}
                                  onChange={(e) => updateExercise(exercise.id, 'weight', e.target.value)}
                                  className="h-6 text-center text-sm font-medium"
                                  placeholder="lbs"
                                />
                              </div>

                              <div className="text-center">
                                <label className="text-xs text-muted-foreground block mb-1">Rest</label>
                                <Input
                                  type="number"
                                  value={exercise.rest_seconds || 60}
                                  onChange={(e) => updateExercise(exercise.id, 'rest_seconds', parseInt(e.target.value) || 60)}
                                  className="h-6 text-center text-sm font-medium"
                                  min="0"
                                />
                              </div>
                            </div>

                            {/* Superset Controls */}
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (exercise.superset_group_id) {
                                    updateExercise(exercise.id, 'superset_group_id', undefined);
                                  } else {
                                    toggleSuperset([exercise.id]);
                                  }
                                }}
                                className="text-xs h-6"
                              >
                                {exercise.superset_group_id ? (
                                  <>
                                    <Unlink size={10} className="mr-1" />
                                    Remove from Superset
                                  </>
                                ) : (
                                  <>
                                    <Link size={10} className="mr-1" />
                                    Create Superset
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <div className="space-y-2">
              {currentWorkout.exercises
                .slice(0, showFullExercises ? undefined : 3)
                .map((exercise, index) => (
                  <div
                    key={exercise.id}
                    className={cn(
                      "flex items-center justify-between p-2 rounded-md transition-colors",
                      exercise.completed 
                        ? "bg-green-50 text-green-800" 
                        : "bg-background/50"
                    )}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <div className="flex-shrink-0">
                        {exercise.completed ? (
                          <CheckCircle size={16} className="text-green-600" />
                        ) : (
                          <Circle size={16} className="text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={cn(
                            "text-sm font-medium truncate",
                            exercise.completed && "line-through"
                          )}>
                            {exercise.name}
                          </p>
                          {exercise.source === 'voice' && (
                            <Badge variant="outline" className="text-xs bg-blue-100">
                              Voice
                            </Badge>
                          )}
                          {exercise.superset_group_id && (
                            <Badge variant="outline" className="text-xs">
                              <Link size={8} className="mr-1" />
                              SS
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {exercise.sets} × {exercise.reps}
                          {exercise.weight && exercise.weight !== 'bodyweight' && 
                            ` @ ${exercise.weight}`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

              {!showFullExercises && totalExercises > 3 && (
                <div className="text-center py-2">
                  <span className="text-xs text-muted-foreground">
                    +{totalExercises - 3} more exercises
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Progress Section */}
        {!currentWorkout.is_completed && !isEditMode && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-medium">Progress</span>
              <span className="font-semibold">
                {completedExercises}/{totalExercises} completed
              </span>
            </div>
            <Progress 
              value={progress} 
              className="h-2"
            />
          </div>
        )}

        {/* Bottom CTA Section */}
        {!isEditMode && (
          <div className="space-y-2 pt-2">
            {currentWorkout.is_completed ? (
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => onStart?.(currentWorkout)}
                className="w-full text-green-600 border-green-200 hover:bg-green-50"
              >
                <TrendingUp size={16} className="mr-2" />
                View Results
              </Button>
            ) : (
              <Button 
                onClick={() => onStart?.(currentWorkout)}
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
                className="flex-1 text-muted-foreground hover:text-foreground"
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
        )}

        {/* Empty State */}
        {currentWorkout.exercises.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Dumbbell className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No exercises in this workout</p>
            <p className="text-xs mt-1">Add exercises to get started</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
