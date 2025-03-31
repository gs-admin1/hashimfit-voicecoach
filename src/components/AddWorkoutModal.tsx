
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Dumbbell, X } from "lucide-react";
import { AnimatedCard } from "./ui-components";
import { toast } from "@/hooks/use-toast";

interface Workout {
  id: string;
  title: string;
  category: string;
  exercises: {
    name: string;
    sets: number;
    reps: string;
    weight?: string;
  }[];
}

interface AddWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWorkout: (workout: Workout) => void;
  selectedDay: string;
}

export function AddWorkoutModal({ isOpen, onClose, onAddWorkout, selectedDay }: AddWorkoutModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [workouts, setWorkouts] = useState<Workout[]>([
    {
      id: "w1",
      title: "Upper Body Strength",
      category: "strength",
      exercises: [
        { name: "Bench Press", sets: 4, reps: "8-10", weight: "60kg" },
        { name: "Shoulder Press", sets: 3, reps: "10-12", weight: "40kg" },
        { name: "Pull-ups", sets: 3, reps: "8-10" },
        { name: "Tricep Dips", sets: 3, reps: "12-15" }
      ]
    },
    {
      id: "w2",
      title: "Lower Body Power",
      category: "strength",
      exercises: [
        { name: "Squats", sets: 4, reps: "8-10", weight: "80kg" },
        { name: "Deadlifts", sets: 3, reps: "8-10", weight: "100kg" },
        { name: "Lunges", sets: 3, reps: "10-12", weight: "40kg" },
        { name: "Calf Raises", sets: 3, reps: "15-20", weight: "60kg" }
      ]
    },
    {
      id: "w3",
      title: "HIIT Cardio",
      category: "cardio",
      exercises: [
        { name: "Burpees", sets: 3, reps: "45 sec" },
        { name: "Mountain Climbers", sets: 3, reps: "45 sec" },
        { name: "Jump Squats", sets: 3, reps: "45 sec" },
        { name: "Jumping Jacks", sets: 3, reps: "45 sec" }
      ]
    }
  ]);

  // Filter workouts based on search term
  const filteredWorkouts = workouts.filter(workout => 
    workout.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    workout.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectWorkout = (workout: Workout) => {
    onAddWorkout(workout);
    toast({
      title: "Workout Added",
      description: `${workout.title} added to ${selectedDay}'s workout plan`,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Add Workout for {selectedDay}</DialogTitle>
        </DialogHeader>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search workouts..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {filteredWorkouts.length > 0 ? (
            filteredWorkouts.map((workout) => (
              <AnimatedCard 
                key={workout.id} 
                className="cursor-pointer hover:border-hashim-300"
                onClick={() => handleSelectWorkout(workout)}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Dumbbell size={18} className="text-hashim-600" />
                  <h3 className="font-medium">{workout.title}</h3>
                  <span className="text-xs px-2 py-1 bg-hashim-50 text-hashim-600 rounded-full ml-auto">
                    {workout.category}
                  </span>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  {workout.exercises.length} exercises
                </div>
              </AnimatedCard>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No workouts found</p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button onClick={onClose} variant="outline">Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
