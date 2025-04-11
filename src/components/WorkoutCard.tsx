
import { useState } from "react";
import { AnimatedCard } from "./ui-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, ChevronDown, ChevronUp, Plus, X, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight: string;
  completed?: boolean;
}

interface WorkoutCardProps {
  workout: {
    id?: string;
    schedule_id?: string;
    title: string;
    exercises: Exercise[];
    is_completed?: boolean;
  };
  editable?: boolean;
  onExerciseComplete?: (exerciseId: string, completed: boolean) => void;
  onAddExercise?: (workoutId: string, exercise: { name: string; sets: number; reps: string; weight: string }) => void;
  onRemoveExercise?: (exerciseId: string) => void;
}

export function WorkoutCard({ 
  workout, 
  editable = false, 
  onExerciseComplete, 
  onAddExercise, 
  onRemoveExercise 
}: WorkoutCardProps) {
  const [expanded, setExpanded] = useState(true);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [newExercise, setNewExercise] = useState({ name: '', sets: 3, reps: '10', weight: 'bodyweight' });

  // Note: We're no longer managing exercises state locally in this component
  // Instead, we'll rely on the parent component to manage this state
  
  const toggleExerciseCompletion = (exerciseId: string, currentStatus: boolean) => {
    // Call parent callback if provided
    if (onExerciseComplete) {
      onExerciseComplete(exerciseId, !currentStatus);
    }
  };

  const handleAddExercise = () => {
    // Validate
    if (!newExercise.name.trim()) {
      return;
    }
    
    // Call parent callback
    if (onAddExercise && workout.id) {
      onAddExercise(workout.id, newExercise);
      // Reset form
      setNewExercise({ name: '', sets: 3, reps: '10', weight: 'bodyweight' });
      setShowAddExercise(false);
    }
  };

  const handleRemoveExercise = (exerciseId: string) => {
    if (onRemoveExercise) {
      onRemoveExercise(exerciseId);
    }
  };

  const completedCount = workout.exercises.filter((ex) => ex.completed).length;
  const progress = workout.exercises.length > 0 ? (completedCount / workout.exercises.length) * 100 : 0;

  return (
    <AnimatedCard>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-bold text-lg">{workout.title}</h3>
          <p className="text-sm text-muted-foreground">
            {workout.exercises.length} exercises • {completedCount} completed
          </p>
        </div>
        <button 
          onClick={() => setExpanded(!expanded)}
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          {expanded ? (
            <ChevronUp size={20} />
          ) : (
            <ChevronDown size={20} />
          )}
        </button>
      </div>

      <Progress value={progress} className="h-2 mb-4" />

      {expanded && (
        <div className="space-y-3 mt-6">
          {workout.exercises.map((exercise) => (
            <div 
              key={exercise.id}
              className={cn(
                "flex items-center p-3 rounded-xl transition-all duration-300",
                exercise.completed ? "bg-hashim-50 dark:bg-hashim-900/20" : ""
              )}
            >
              <Checkbox
                checked={!!exercise.completed}
                onCheckedChange={() => toggleExerciseCompletion(exercise.id, !!exercise.completed)}
                className="mr-3"
                id={`exercise-${exercise.id}`}
              />
              <label 
                htmlFor={`exercise-${exercise.id}`} 
                className="flex-1 cursor-pointer"
              >
                <p className="font-medium">{exercise.name}</p>
                <p className="text-sm text-muted-foreground">
                  {exercise.sets} sets • {exercise.reps} reps • {exercise.weight}
                </p>
              </label>
              
              {editable && (
                <button
                  onClick={() => handleRemoveExercise(exercise.id)}
                  className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          ))}
          
          {editable && showAddExercise ? (
            <div className="border rounded-xl p-4 space-y-3">
              <h4 className="font-medium text-sm">Add Exercise</h4>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Exercise Name</label>
                <Input 
                  value={newExercise.name}
                  onChange={(e) => setNewExercise({...newExercise, name: e.target.value})}
                  placeholder="e.g. Bench Press"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Sets</label>
                  <Input 
                    type="number" 
                    min={1}
                    value={newExercise.sets}
                    onChange={(e) => setNewExercise({...newExercise, sets: parseInt(e.target.value) || 1})}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Reps</label>
                  <Input 
                    value={newExercise.reps}
                    onChange={(e) => setNewExercise({...newExercise, reps: e.target.value})}
                    placeholder="e.g. 10 or 8-12"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Weight</label>
                  <Input 
                    value={newExercise.weight}
                    onChange={(e) => setNewExercise({...newExercise, weight: e.target.value})}
                    placeholder="e.g. 50kg"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowAddExercise(false)}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm"
                  onClick={handleAddExercise}
                >
                  Add
                </Button>
              </div>
            </div>
          ) : editable && (
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center"
              onClick={() => setShowAddExercise(true)}
            >
              <Plus size={16} className="mr-1" />
              Add Exercise
            </Button>
          )}
        </div>
      )}
    </AnimatedCard>
  );
}
