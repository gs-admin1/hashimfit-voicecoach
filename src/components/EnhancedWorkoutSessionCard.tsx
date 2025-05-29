
import { useState, useEffect } from "react";
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
  RotateCcw,
  Star,
  StarOff,
  GripVertical,
  MoreHorizontal,
  ArrowLeftRight,
  Timer,
  Plus,
  Minus,
  Edit2,
  Save,
  X,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { WorkoutService } from "@/lib/supabase/services/WorkoutService";
import { toast } from "@/hooks/use-toast";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight: string;
  completed?: number;
  rpe?: number;
  rest_seconds?: number;
  superset_group_id?: string;
  position_in_workout?: number;
}

interface WorkoutSessionCardProps {
  workout: {
    id: string;
    title: string;
    exercises: Exercise[];
    category: string;
    workout_log_id?: string;
  };
  onComplete?: () => void;
  onSaveAsFavorite?: () => void;
  onStartRestTimer?: (duration: number) => void;
  className?: string;
}

export function EnhancedWorkoutSessionCard({ 
  workout, 
  onComplete, 
  onSaveAsFavorite,
  onStartRestTimer,
  className 
}: WorkoutSessionCardProps) {
  const [currentExercise, setCurrentExercise] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [exercises, setExercises] = useState(workout.exercises);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [editingExercise, setEditingExercise] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{[key: string]: any}>({});
  const [restTimer, setRestTimer] = useState<number>(0);
  const [timerActive, setTimerActive] = useState(false);
  
  const currentEx = exercises[currentExercise];
  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets, 0);
  const completedSets = exercises.reduce((acc, ex) => acc + (ex.completed || 0), 0);
  const progress = (completedSets / totalSets) * 100;

  // Group exercises by superset
  const groupedExercises = exercises.reduce((acc, ex, index) => {
    if (ex.superset_group_id) {
      if (!acc.supersets[ex.superset_group_id]) {
        acc.supersets[ex.superset_group_id] = [];
      }
      acc.supersets[ex.superset_group_id].push({...ex, originalIndex: index});
    } else {
      acc.individual.push({...ex, originalIndex: index});
    }
    return acc;
  }, { individual: [] as any[], supersets: {} as any });

  // Rest timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => {
          if (prev <= 1) {
            setTimerActive(false);
            toast({
              title: "Rest Complete!",
              description: "Time to start your next set."
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, restTimer]);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(exercises);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update positions
    const updatedItems = items.map((item, index) => ({
      ...item,
      position_in_workout: index
    }));
    
    setExercises(updatedItems);
    
    if (workout.workout_log_id) {
      const positions = updatedItems.map((item, index) => ({
        exercise_id: item.id,
        new_position: index
      }));
      
      const success = await WorkoutService.reorderExercises(workout.workout_log_id, positions);
      if (!success) {
        toast({
          title: "Error",
          description: "Failed to save exercise order",
          variant: "destructive"
        });
        setExercises(workout.exercises); // Revert on error
      }
    }
  };

  const startEditing = (exerciseId: string, field: string, currentValue: any) => {
    setEditingExercise(exerciseId);
    setEditValues({
      [field]: currentValue
    });
  };

  const saveEdit = async (exerciseId: string, field: string) => {
    const newValue = editValues[field];
    if (!newValue && newValue !== 0) return;
    
    setExercises(prev => prev.map(ex => 
      ex.id === exerciseId ? { ...ex, [field]: newValue } : ex
    ));
    
    if (workout.workout_log_id) {
      const success = await WorkoutService.updateExerciseLog(exerciseId, {
        [field]: newValue
      });
      
      if (!success) {
        toast({
          title: "Error",
          description: "Failed to save changes",
          variant: "destructive"
        });
      }
    }
    
    setEditingExercise(null);
    setEditValues({});
  };

  const adjustValue = (exerciseId: string, field: string, delta: number) => {
    const exercise = exercises.find(ex => ex.id === exerciseId);
    if (!exercise) return;
    
    const currentValue = typeof exercise[field as keyof Exercise] === 'number' 
      ? exercise[field as keyof Exercise] as number 
      : parseInt(exercise[field as keyof Exercise] as string) || 0;
    
    const newValue = Math.max(0, currentValue + delta);
    saveEdit(exerciseId, field);
    setEditValues({ [field]: newValue });
  };

  const createSuperset = async () => {
    if (selectedExercises.length < 2) {
      toast({
        title: "Error",
        description: "Select at least 2 exercises to create a superset",
        variant: "destructive"
      });
      return;
    }
    
    if (workout.workout_log_id) {
      const supersetId = await WorkoutService.createSuperset(
        workout.workout_log_id, 
        selectedExercises
      );
      
      if (supersetId) {
        setExercises(prev => prev.map(ex => 
          selectedExercises.includes(ex.id) 
            ? { ...ex, superset_group_id: supersetId }
            : ex
        ));
        setSelectedExercises([]);
        toast({
          title: "Superset Created",
          description: "Exercises have been grouped into a superset"
        });
      }
    }
  };

  const removeFromSuperset = async (exerciseId: string) => {
    const success = await WorkoutService.removeFromSuperset(exerciseId);
    if (success) {
      setExercises(prev => prev.map(ex => 
        ex.id === exerciseId ? { ...ex, superset_group_id: undefined } : ex
      ));
      toast({
        title: "Removed from Superset",
        description: "Exercise removed from superset group"
      });
    }
  };

  const completeSet = () => {
    const updatedExercises = [...exercises];
    updatedExercises[currentExercise].completed = (updatedExercises[currentExercise].completed || 0) + 1;
    setExercises(updatedExercises);
    
    // Start rest timer
    const restTime = currentEx.rest_seconds || 60;
    setRestTimer(restTime);
    setTimerActive(true);
    
    if (onStartRestTimer) {
      onStartRestTimer(restTime);
    }
    
    if (currentSet < currentEx.sets) {
      setCurrentSet(currentSet + 1);
    } else if (currentExercise < exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
      setCurrentSet(1);
    } else {
      onComplete?.();
    }
  };

  const updateRPE = async (exerciseIndex: number, rpe: number) => {
    const exerciseId = exercises[exerciseIndex].id;
    setExercises(prev => prev.map((ex, idx) => 
      idx === exerciseIndex ? { ...ex, rpe } : ex
    ));
    
    if (workout.workout_log_id) {
      await WorkoutService.updateExerciseLog(exerciseId, { rpe });
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    onSaveAsFavorite?.();
  };

  const toggleExerciseSelection = (exerciseId: string) => {
    setSelectedExercises(prev => 
      prev.includes(exerciseId) 
        ? prev.filter(id => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header Card */}
      <Card className="border-l-4 border-l-hashim-500">
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
            <div className="flex items-center space-x-2">
              {selectedExercises.length >= 2 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={createSuperset}
                  className="text-xs"
                >
                  <Users className="h-3 w-3 mr-1" />
                  Superset
                </Button>
              )}
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
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{completedSets}/{totalSets} sets</span>
            </div>
            <div className="relative">
              <Progress value={progress} className="h-3" />
              <div 
                className="absolute top-0 h-3 bg-gradient-to-r from-hashim-400 to-hashim-600 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Rest Timer */}
      {timerActive && (
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Timer className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800">Rest Time</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-bold text-blue-600">
                  {formatTime(restTimer)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTimerActive(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Exercise Card */}
      <Card className="bg-gradient-to-br from-hashim-50 to-white border-2 border-hashim-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-semibold text-xl text-hashim-800">{currentEx.name}</h3>
              <Badge variant="outline" className="mt-1">
                Exercise {currentExercise + 1}/{exercises.length}
              </Badge>
            </div>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleExerciseSelection(currentEx.id)}
                className={cn(
                  "h-8 w-8 p-0",
                  selectedExercises.includes(currentEx.id) && "bg-hashim-100"
                )}
              >
                <ArrowLeftRight size={16} />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            {/* Sets */}
            <div className="text-center bg-white rounded-lg p-3 border">
              <p className="text-sm text-muted-foreground">Set</p>
              <p className="text-2xl font-bold text-hashim-600">{currentSet}</p>
              <p className="text-xs text-muted-foreground">of {currentEx.sets}</p>
            </div>
            
            {/* Reps */}
            <div className="text-center bg-white rounded-lg p-3 border">
              <p className="text-sm text-muted-foreground">Reps</p>
              {editingExercise === currentEx.id ? (
                <div className="flex items-center justify-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => adjustValue(currentEx.id, 'reps', -1)}
                    className="h-6 w-6 p-0"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input 
                    type="text" 
                    value={editValues.reps || currentEx.reps}
                    onChange={(e) => setEditValues({...editValues, reps: e.target.value})}
                    className="text-center font-bold h-8 border-0 bg-transparent text-xl w-16"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => adjustValue(currentEx.id, 'reps', 1)}
                    className="h-6 w-6 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div 
                  className="text-2xl font-bold text-hashim-600 cursor-pointer flex items-center justify-center"
                  onClick={() => startEditing(currentEx.id, 'reps', currentEx.reps)}
                >
                  {currentEx.reps}
                  <Edit2 className="h-3 w-3 ml-1 opacity-50" />
                </div>
              )}
            </div>
            
            {/* Weight */}
            <div className="text-center bg-white rounded-lg p-3 border">
              <p className="text-sm text-muted-foreground">Weight</p>
              {editingExercise === currentEx.id ? (
                <Input 
                  type="text" 
                  value={editValues.weight || currentEx.weight}
                  onChange={(e) => setEditValues({...editValues, weight: e.target.value})}
                  className="text-center font-bold h-8 border-0 bg-transparent text-xl"
                  onBlur={() => saveEdit(currentEx.id, 'weight')}
                />
              ) : (
                <div 
                  className="text-2xl font-bold text-hashim-600 cursor-pointer flex items-center justify-center"
                  onClick={() => startEditing(currentEx.id, 'weight', currentEx.weight)}
                >
                  {currentEx.weight}
                  <Edit2 className="h-3 w-3 ml-1 opacity-50" />
                </div>
              )}
            </div>
          </div>
          
          {/* RPE Selector */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-3">Rate of Perceived Exertion (RPE)</p>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rpe) => (
                <Button
                  key={rpe}
                  variant={currentEx.rpe === rpe ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "w-8 h-8 p-0 text-xs transition-all",
                    rpe <= 3 && "border-green-300 text-green-600 hover:bg-green-50",
                    rpe > 3 && rpe <= 6 && "border-yellow-300 text-yellow-600 hover:bg-yellow-50",
                    rpe > 6 && rpe <= 8 && "border-orange-300 text-orange-600 hover:bg-orange-50",
                    rpe > 8 && "border-red-300 text-red-600 hover:bg-red-50",
                    currentEx.rpe === rpe && "ring-2 ring-hashim-300"
                  )}
                  onClick={() => updateRPE(currentExercise, rpe)}
                >
                  {rpe}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                const restTime = currentEx.rest_seconds || 60;
                setRestTimer(restTime);
                setTimerActive(true);
              }}
              className="flex-1"
            >
              <Timer size={16} className="mr-2" />
              Rest {currentEx.rest_seconds || 60}s
            </Button>
            
            <Button 
              onClick={completeSet}
              className="flex-2 bg-hashim-600 hover:bg-hashim-700 text-white"
              size="lg"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Complete Set {currentSet}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Exercise List with Drag & Drop */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            All Exercises
            {selectedExercises.length > 0 && (
              <Badge variant="secondary">
                {selectedExercises.length} selected
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="exercises">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {exercises.map((exercise, index) => (
                    <Draggable key={exercise.id} draggableId={exercise.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer mb-2",
                            index === currentExercise ? "bg-hashim-100 border-hashim-300 ring-2 ring-hashim-200" : "bg-gray-50 border-gray-200 hover:bg-gray-100",
                            index < currentExercise && "opacity-60",
                            exercise.superset_group_id && "border-l-4 border-l-blue-400 bg-blue-50",
                            selectedExercises.includes(exercise.id) && "ring-2 ring-orange-300 bg-orange-50",
                            snapshot.isDragging && "shadow-lg scale-105"
                          )}
                          onClick={() => {
                            setCurrentExercise(index);
                            setCurrentSet(1);
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <div 
                              {...provided.dragHandleProps}
                              className="cursor-grab active:cursor-grabbing"
                            >
                              <GripVertical className="h-4 w-4 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <p className="font-medium">{exercise.name}</p>
                                {exercise.superset_group_id && (
                                  <Badge variant="outline" className="text-xs bg-blue-100">
                                    Superset
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {exercise.sets} sets × {exercise.reps} reps @ {exercise.weight}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExerciseSelection(exercise.id);
                              }}
                              className={cn(
                                "h-8 w-8 p-0",
                                selectedExercises.includes(exercise.id) && "bg-orange-200"
                              )}
                            >
                              <ArrowLeftRight className="h-3 w-3" />
                            </Button>
                            
                            {exercise.superset_group_id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFromSuperset(exercise.id);
                                }}
                                className="h-8 w-8 p-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                            
                            {exercise.completed && (
                              <Badge variant="secondary" className="text-xs">
                                {exercise.completed}/{exercise.sets}
                              </Badge>
                            )}
                            {index < currentExercise && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                            {index === currentExercise && (
                              <div className="w-2 h-2 bg-hashim-600 rounded-full animate-pulse" />
                            )}
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
        </CardContent>
      </Card>
    </div>
  );
}
