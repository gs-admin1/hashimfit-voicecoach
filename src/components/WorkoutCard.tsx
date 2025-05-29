
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { 
  Play, 
  MessageCircle, 
  RotateCcw, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X,
  Clock,
  Dumbbell,
  Target,
  Zap,
  CheckCircle2,
  Circle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight: string;
  completed: boolean;
  source: 'planned' | 'voice';
  rest_seconds?: number;
  superset_group_id?: string | null;
  position_in_workout?: number;
}

interface WorkoutCardProps {
  workout: {
    id: string;
    schedule_id?: string;
    title: string;
    exercises: Exercise[];
    category?: string;
    isFavorite?: boolean;
    estimatedDuration?: number;
    targetMuscles?: string[];
    difficulty?: number;
    aiGenerated?: boolean;
    isCompleted?: boolean;
    scheduledDate?: string;
    scheduledTime?: string;
    streak?: number;
    workout_log_id?: string;
  };
  onStart?: (workout: any) => void;
  onEdit?: (workout: any) => void;
  onAskCoach?: () => void;
  onReplaceWorkout?: () => void;
  onUpdateWorkout?: (updatedWorkout: any, saveType: 'today' | 'all_future') => void;
}

export function WorkoutCard({ 
  workout, 
  onStart, 
  onEdit, 
  onAskCoach, 
  onReplaceWorkout, 
  onUpdateWorkout 
}: WorkoutCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedExercises, setEditedExercises] = useState<Exercise[]>(workout.exercises);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [newExercise, setNewExercise] = useState({
    name: "",
    sets: 3,
    reps: "10",
    weight: "bodyweight",
    rest_seconds: 60
  });

  // Calculate progress
  const completedExercises = workout.exercises.filter(ex => ex.completed).length;
  const totalExercises = workout.exercises.length;
  const progressPercentage = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

  // Update edited exercises when workout changes
  useEffect(() => {
    setEditedExercises(workout.exercises);
  }, [workout.exercises]);

  // Check if there are unsaved changes
  const hasChanges = JSON.stringify(editedExercises) !== JSON.stringify(workout.exercises);

  const handleStartEditing = () => {
    setIsEditing(true);
    setEditedExercises([...workout.exercises]);
  };

  const handleCancelEditing = () => {
    if (hasChanges) {
      setShowResetDialog(true);
    } else {
      setIsEditing(false);
    }
  };

  const handleResetChanges = () => {
    setEditedExercises([...workout.exercises]);
    setIsEditing(false);
    setShowResetDialog(false);
  };

  const handleSaveChanges = () => {
    setShowSaveModal(true);
  };

  const handleConfirmSave = (saveType: 'today' | 'all_future') => {
    // Process superset information properly
    const processedExercises = editedExercises.map(ex => ({
      ...ex,
      // Ensure superset_group_id is properly maintained
      superset_group_id: ex.superset_group_id || null
    }));

    const updatedWorkout = {
      ...workout,
      exercises: processedExercises
    };

    onUpdateWorkout?.(updatedWorkout, saveType);
    setIsEditing(false);
    setShowSaveModal(false);
  };

  const handleAddExercise = () => {
    if (!newExercise.name.trim()) return;

    const exercise: Exercise = {
      id: `new-${Date.now()}`,
      name: newExercise.name,
      sets: newExercise.sets,
      reps: newExercise.reps,
      weight: newExercise.weight,
      completed: false,
      source: 'planned',
      rest_seconds: newExercise.rest_seconds,
      superset_group_id: null,
      position_in_workout: editedExercises.length
    };

    setEditedExercises([...editedExercises, exercise]);
    setNewExercise({
      name: "",
      sets: 3,
      reps: "10",
      weight: "bodyweight",
      rest_seconds: 60
    });
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setEditedExercises(editedExercises.filter(ex => ex.id !== exerciseId));
  };

  const handleUpdateExercise = (exerciseId: string, field: string, value: any) => {
    setEditedExercises(editedExercises.map(ex => 
      ex.id === exerciseId ? { ...ex, [field]: value } : ex
    ));
  };

  const createSuperset = (exerciseIds: string[]) => {
    if (exerciseIds.length < 2) return;
    
    const supersetId = `superset-${Date.now()}`;
    setEditedExercises(editedExercises.map(ex => 
      exerciseIds.includes(ex.id) ? { ...ex, superset_group_id: supersetId } : ex
    ));
  };

  const removeFromSuperset = (exerciseId: string) => {
    setEditedExercises(editedExercises.map(ex => 
      ex.id === exerciseId ? { ...ex, superset_group_id: null } : ex
    ));
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'strength': return 'from-blue-500 to-indigo-600';
      case 'cardio': return 'from-red-500 to-pink-600';
      case 'hiit': return 'from-orange-500 to-red-600';
      case 'recovery': return 'from-green-500 to-emerald-600';
      case 'sport_specific': return 'from-purple-500 to-violet-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getDifficultyColor = (difficulty?: number) => {
    if (!difficulty) return 'bg-gray-100 text-gray-600';
    if (difficulty <= 2) return 'bg-green-100 text-green-700';
    if (difficulty <= 4) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const groupedExercises = editedExercises.reduce((groups, exercise) => {
    const groupId = exercise.superset_group_id || exercise.id;
    if (!groups[groupId]) {
      groups[groupId] = [];
    }
    groups[groupId].push(exercise);
    return groups;
  }, {} as Record<string, Exercise[]>);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        {/* Header with gradient */}
        <div className={`bg-gradient-to-r ${getCategoryColor(workout.category)} p-6 text-white relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-2">
                <h3 className="text-xl font-bold leading-tight">{workout.title}</h3>
                <div className="flex items-center space-x-3 text-white/90">
                  <div className="flex items-center space-x-1">
                    <Clock size={14} />
                    <span className="text-sm">{workout.estimatedDuration || 45}min</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Target size={14} />
                    <span className="text-sm">{totalExercises} exercises</span>
                  </div>
                  {workout.difficulty && (
                    <Badge className={`${getDifficultyColor(workout.difficulty)} text-xs border-0`}>
                      Level {workout.difficulty}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col items-end space-y-2">
                {workout.aiGenerated && (
                  <Badge className="bg-white/20 text-white border-white/30 text-xs">
                    <Zap size={12} className="mr-1" />
                    AI Generated
                  </Badge>
                )}
                {workout.streak && workout.streak > 1 && (
                  <Badge className="bg-orange-500/90 text-white border-0 text-xs">
                    🔥 {workout.streak} streak
                  </Badge>
                )}
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/90">Progress</span>
                <span className="font-medium">{completedExercises}/{totalExercises}</span>
              </div>
              <Progress 
                value={progressPercentage} 
                className="h-2 bg-white/20"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Target Muscles */}
          {workout.targetMuscles && workout.targetMuscles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {workout.targetMuscles.map((muscle, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
                >
                  {muscle}
                </Badge>
              ))}
            </div>
          )}

          {/* Exercises */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <Dumbbell size={16} className="mr-2 text-blue-600" />
                Exercises
              </h4>
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartEditing}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <Edit3 size={14} className="mr-1" />
                  Edit
                </Button>
              )}
            </div>

            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div
                  key="editing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {/* Exercise List in Edit Mode */}
                  {Object.entries(groupedExercises).map(([groupId, exercises]) => (
                    <div key={groupId} className="space-y-2">
                      {exercises.length > 1 && exercises[0].superset_group_id && (
                        <div className="text-sm font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full inline-block">
                          Superset Group
                        </div>
                      )}
                      {exercises.map((exercise, index) => (
                        <motion.div
                          key={exercise.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className={`p-4 rounded-xl border-2 ${
                            exercise.superset_group_id 
                              ? 'border-purple-200 bg-purple-50/50' 
                              : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="grid grid-cols-12 gap-3 items-center">
                            <div className="col-span-4">
                              <Input
                                value={exercise.name}
                                onChange={(e) => handleUpdateExercise(exercise.id, 'name', e.target.value)}
                                className="text-sm font-medium border-0 bg-white/80 focus:bg-white"
                                placeholder="Exercise name"
                              />
                            </div>
                            <div className="col-span-2">
                              <Input
                                type="number"
                                value={exercise.sets}
                                onChange={(e) => handleUpdateExercise(exercise.id, 'sets', parseInt(e.target.value) || 1)}
                                className="text-sm border-0 bg-white/80 focus:bg-white"
                                min="1"
                              />
                            </div>
                            <div className="col-span-2">
                              <Input
                                value={exercise.reps}
                                onChange={(e) => handleUpdateExercise(exercise.id, 'reps', e.target.value)}
                                className="text-sm border-0 bg-white/80 focus:bg-white"
                                placeholder="10"
                              />
                            </div>
                            <div className="col-span-3">
                              <Input
                                value={exercise.weight}
                                onChange={(e) => handleUpdateExercise(exercise.id, 'weight', e.target.value)}
                                className="text-sm border-0 bg-white/80 focus:bg-white"
                                placeholder="bodyweight"
                              />
                            </div>
                            <div className="col-span-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveExercise(exercise.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-8 w-8"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ))}

                  {/* Add New Exercise */}
                  <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50">
                    <div className="grid grid-cols-12 gap-3 items-center">
                      <div className="col-span-4">
                        <Input
                          value={newExercise.name}
                          onChange={(e) => setNewExercise({...newExercise, name: e.target.value})}
                          placeholder="Exercise name"
                          className="border-0 bg-white/80 focus:bg-white"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          value={newExercise.sets}
                          onChange={(e) => setNewExercise({...newExercise, sets: parseInt(e.target.value) || 1})}
                          min="1"
                          className="border-0 bg-white/80 focus:bg-white"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          value={newExercise.reps}
                          onChange={(e) => setNewExercise({...newExercise, reps: e.target.value})}
                          placeholder="10"
                          className="border-0 bg-white/80 focus:bg-white"
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          value={newExercise.weight}
                          onChange={(e) => setNewExercise({...newExercise, weight: e.target.value})}
                          placeholder="bodyweight"
                          className="border-0 bg-white/80 focus:bg-white"
                        />
                      </div>
                      <div className="col-span-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleAddExercise}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 p-1 h-8 w-8"
                          disabled={!newExercise.name.trim()}
                        >
                          <Plus size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Edit Actions */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      onClick={handleCancelEditing}
                      className="text-gray-600 border-gray-300"
                    >
                      <X size={16} className="mr-2" />
                      Cancel
                    </Button>
                    <div className="space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowResetDialog(true)}
                        className="text-orange-600 border-orange-300 hover:bg-orange-50"
                        disabled={!hasChanges}
                      >
                        <RotateCcw size={16} className="mr-2" />
                        Reset
                      </Button>
                      <Button
                        onClick={handleSaveChanges}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                        disabled={!hasChanges}
                      >
                        <Save size={16} className="mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="viewing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  {Object.entries(groupedExercises).map(([groupId, exercises]) => (
                    <div key={groupId} className="space-y-2">
                      {exercises.length > 1 && exercises[0].superset_group_id && (
                        <div className="text-sm font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full inline-block">
                          Superset Group
                        </div>
                      )}
                      {exercises.map((exercise) => (
                        <motion.div
                          key={exercise.id}
                          whileHover={{ scale: 1.02 }}
                          className={`p-4 rounded-xl border transition-all duration-200 ${
                            exercise.completed
                              ? 'border-green-200 bg-green-50'
                              : exercise.superset_group_id
                              ? 'border-purple-200 bg-purple-50/50 hover:bg-purple-50'
                              : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {exercise.completed ? (
                                <CheckCircle2 size={20} className="text-green-600" />
                              ) : (
                                <Circle size={20} className="text-gray-400" />
                              )}
                              <div>
                                <h5 className={`font-medium ${exercise.completed ? 'text-green-900' : 'text-gray-900'}`}>
                                  {exercise.name}
                                </h5>
                                <p className={`text-sm ${exercise.completed ? 'text-green-700' : 'text-gray-600'}`}>
                                  {exercise.sets} sets × {exercise.reps} reps
                                  {exercise.weight && exercise.weight !== 'bodyweight' && ` @ ${exercise.weight}`}
                                </p>
                              </div>
                            </div>
                            {exercise.source === 'voice' && (
                              <Badge className="bg-blue-100 text-blue-700 text-xs">
                                Voice Added
                              </Badge>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Buttons */}
          {!isEditing && (
            <div className="flex flex-col space-y-3 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => onStart?.(workout)}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-3"
                >
                  <Play size={16} className="mr-2" />
                  Start Workout
                </Button>
                <Button
                  variant="outline"
                  onClick={onAskCoach}
                  className="border-blue-200 text-blue-600 hover:bg-blue-50 font-medium py-3"
                >
                  <MessageCircle size={16} className="mr-2" />
                  Ask Coach
                </Button>
              </div>
              <Button
                variant="outline"
                onClick={onReplaceWorkout}
                className="w-full border-orange-200 text-orange-600 hover:bg-orange-50"
              >
                <RotateCcw size={16} className="mr-2" />
                Replace Workout
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Save Modal */}
      <Dialog open={showSaveModal} onOpenChange={setShowSaveModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Save Workout Changes
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-gray-600">
              How would you like to apply these changes to your <strong>"{workout.title}"</strong> workouts?
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => handleConfirmSave('today')}
                variant="outline"
                className="w-full justify-start text-left h-auto p-4 border-2 hover:border-blue-300"
              >
                <div>
                  <div className="font-medium text-gray-900">Save for today only</div>
                  <div className="text-sm text-gray-600">
                    Changes will only apply to this specific workout session
                  </div>
                </div>
              </Button>
              <Button
                onClick={() => handleConfirmSave('all_future')}
                variant="outline"
                className="w-full justify-start text-left h-auto p-4 border-2 hover:border-green-300"
              >
                <div>
                  <div className="font-medium text-gray-900">Save for all future workouts</div>
                  <div className="text-sm text-gray-600">
                    Changes will apply to all upcoming "{workout.title}" workouts
                  </div>
                </div>
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveModal(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              This will discard all your unsaved changes and return to the original workout. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Editing</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleResetChanges}
              className="bg-red-600 hover:bg-red-700"
            >
              Reset Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
