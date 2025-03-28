
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus, Trash2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  weight: string;
}

interface WorkoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (workout: { title: string; exercises: Exercise[]; category: string }) => void;
}

export function AddWorkoutModal({ isOpen, onClose, onAdd }: WorkoutDialogProps) {
  const [title, setTitle] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([
    { name: "", sets: 3, reps: "8-12", weight: "kg" }
  ]);
  const [category, setCategory] = useState("strength");

  const addExercise = () => {
    setExercises([...exercises, { name: "", sets: 3, reps: "8-12", weight: "kg" }]);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: keyof Exercise, value: string | number) => {
    const updatedExercises = [...exercises];
    updatedExercises[index] = { ...updatedExercises[index], [field]: value };
    setExercises(updatedExercises);
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a workout title",
        variant: "destructive"
      });
      return;
    }

    if (exercises.some(ex => !ex.name.trim())) {
      toast({
        title: "Missing information",
        description: "Please provide a name for all exercises",
        variant: "destructive"
      });
      return;
    }

    onAdd({
      title,
      exercises,
      category
    });
    
    // Reset form
    setTitle("");
    setExercises([{ name: "", sets: 3, reps: "8-12", weight: "kg" }]);
    setCategory("strength");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Add New Workout
          </DialogTitle>
          <DialogClose className="absolute right-4 top-4">
            <X size={18} />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor="workout-title">Workout Title</Label>
            <Input
              id="workout-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Upper Body Strength"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label>Category</Label>
            <RadioGroup 
              value={category}
              onValueChange={setCategory}
              className="flex space-x-4 mt-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="strength" id="strength" />
                <Label htmlFor="strength">Strength</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cardio" id="cardio" />
                <Label htmlFor="cardio">Cardio</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="recovery" id="recovery" />
                <Label htmlFor="recovery">Recovery</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Exercises</Label>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={addExercise}
                className="h-8 text-hashim-600 border-hashim-300 hover:bg-hashim-50"
              >
                <Plus size={16} className="mr-1" />
                Add Exercise
              </Button>
            </div>
            
            <div className="space-y-4">
              {exercises.map((exercise, index) => (
                <div key={index} className="border rounded-lg p-3 space-y-3">
                  <div className="flex justify-between items-center">
                    <Label htmlFor={`exercise-name-${index}`} className="text-sm font-medium">
                      Exercise {index + 1}
                    </Label>
                    {exercises.length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeExercise(index)}
                        className="h-6 w-6 p-0 text-hashim-600 hover:text-hashim-700 hover:bg-hashim-50"
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                  
                  <Input
                    id={`exercise-name-${index}`}
                    value={exercise.name}
                    onChange={(e) => updateExercise(index, "name", e.target.value)}
                    placeholder="Exercise name"
                  />
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label htmlFor={`sets-${index}`} className="text-xs">Sets</Label>
                      <Input
                        id={`sets-${index}`}
                        type="number"
                        min="1"
                        value={exercise.sets}
                        onChange={(e) => updateExercise(index, "sets", parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`reps-${index}`} className="text-xs">Reps</Label>
                      <Input
                        id={`reps-${index}`}
                        value={exercise.reps}
                        onChange={(e) => updateExercise(index, "reps", e.target.value)}
                        placeholder="e.g., 8-12 or 30s"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`weight-${index}`} className="text-xs">Weight</Label>
                      <Input
                        id={`weight-${index}`}
                        value={exercise.weight}
                        onChange={(e) => updateExercise(index, "weight", e.target.value)}
                        placeholder="e.g., 50kg or BW"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              className="bg-hashim-600 hover:bg-hashim-700 text-white"
            >
              Add Workout
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
