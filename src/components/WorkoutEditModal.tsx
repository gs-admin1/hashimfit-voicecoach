
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  Trash2, 
  Save,
  X
} from "lucide-react";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight: string;
  completed?: boolean;
  source?: 'planned' | 'voice';
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

interface WorkoutEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  workout: Workout;
  onSave: (workout: Workout, applyToAll: boolean) => void;
}

export function WorkoutEditModal({
  isOpen,
  onClose,
  workout,
  onSave
}: WorkoutEditModalProps) {
  const [editedWorkout, setEditedWorkout] = useState<Workout>(workout);
  const [applyToAll, setApplyToAll] = useState(false);

  const handleSave = () => {
    onSave(editedWorkout, applyToAll);
  };

  const addExercise = () => {
    const newExercise: Exercise = {
      id: `exercise-${Date.now()}`,
      name: '',
      sets: 3,
      reps: '10',
      weight: 'bodyweight'
    };
    setEditedWorkout({
      ...editedWorkout,
      exercises: [...editedWorkout.exercises, newExercise]
    });
  };

  const removeExercise = (exerciseId: string) => {
    setEditedWorkout({
      ...editedWorkout,
      exercises: editedWorkout.exercises.filter(ex => ex.id !== exerciseId)
    });
  };

  const updateExercise = (exerciseId: string, updates: Partial<Exercise>) => {
    setEditedWorkout({
      ...editedWorkout,
      exercises: editedWorkout.exercises.map(ex =>
        ex.id === exerciseId ? { ...ex, ...updates } : ex
      )
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit Workout</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Workout Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Workout Title</Label>
              <Input
                id="title"
                value={editedWorkout.title}
                onChange={(e) => setEditedWorkout({
                  ...editedWorkout,
                  title: e.target.value
                })}
                placeholder="Enter workout title"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Estimated Duration (min)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={editedWorkout.estimatedDuration || ''}
                  onChange={(e) => setEditedWorkout({
                    ...editedWorkout,
                    estimatedDuration: parseInt(e.target.value) || undefined
                  })}
                  placeholder="45"
                />
              </div>
              <div>
                <Label htmlFor="difficulty">Difficulty (1-5)</Label>
                <Select
                  value={editedWorkout.difficulty?.toString() || '3'}
                  onValueChange={(value) => setEditedWorkout({
                    ...editedWorkout,
                    difficulty: parseInt(value)
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Beginner</SelectItem>
                    <SelectItem value="2">2 - Easy</SelectItem>
                    <SelectItem value="3">3 - Intermediate</SelectItem>
                    <SelectItem value="4">4 - Hard</SelectItem>
                    <SelectItem value="5">5 - Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Exercises */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Exercises</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={addExercise}
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Add Exercise
              </Button>
            </div>

            <div className="space-y-3">
              {editedWorkout.exercises.map((exercise, index) => (
                <div key={exercise.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Exercise {index + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeExercise(exercise.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>

                  <div>
                    <Label>Exercise Name</Label>
                    <Input
                      value={exercise.name}
                      onChange={(e) => updateExercise(exercise.id, { name: e.target.value })}
                      placeholder="e.g., Push-ups"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label>Sets</Label>
                      <Input
                        type="number"
                        value={exercise.sets}
                        onChange={(e) => updateExercise(exercise.id, { 
                          sets: parseInt(e.target.value) || 1 
                        })}
                        min="1"
                      />
                    </div>
                    <div>
                      <Label>Reps</Label>
                      <Input
                        value={exercise.reps}
                        onChange={(e) => updateExercise(exercise.id, { reps: e.target.value })}
                        placeholder="10"
                      />
                    </div>
                    <div>
                      <Label>Weight</Label>
                      <Input
                        value={exercise.weight}
                        onChange={(e) => updateExercise(exercise.id, { weight: e.target.value })}
                        placeholder="bodyweight"
                      />
                    </div>
                  </div>

                  {exercise.source === 'voice' && (
                    <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700">
                      Added via Voice
                    </Badge>
                  )}
                </div>
              ))}

              {editedWorkout.exercises.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No exercises added yet</p>
                  <p className="text-xs mt-1">Click "Add Exercise" to get started</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="applyToAll"
                checked={applyToAll}
                onChange={(e) => setApplyToAll(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="applyToAll" className="text-sm">
                Apply changes to all future instances of this workout
              </Label>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                <X size={16} className="mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1 bg-hashim-600 hover:bg-hashim-700 text-white"
              >
                <Save size={16} className="mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
