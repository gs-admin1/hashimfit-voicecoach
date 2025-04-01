
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { WorkoutService } from "@/lib/supabase/services/WorkoutService";
import { X, Search, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface AddWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWorkout: (workout: any) => void;
  selectedDay: string;
}

export function AddWorkoutModal({ isOpen, onClose, onAddWorkout, selectedDay }: AddWorkoutModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { userId } = useAuth();
  
  // Query for available workouts
  const { data: workouts = [], isLoading } = useQuery({
    queryKey: ['workoutPlans', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const workoutPlans = await WorkoutService.getWorkoutPlans(userId);
      
      // Get exercises for each workout plan
      const workoutsWithExercises = await Promise.all(
        workoutPlans.map(async (plan) => {
          const exercises = await WorkoutService.getWorkoutExercises(plan.id!);
          return {
            id: plan.id,
            title: plan.title,
            category: plan.category,
            exercises: exercises.map(ex => ({
              id: ex.id,
              name: ex.name,
              sets: ex.sets,
              reps: ex.reps,
              weight: ex.weight || 'bodyweight'
            }))
          };
        })
      );
      
      return workoutsWithExercises;
    },
    enabled: !!userId && isOpen,
  });

  const filteredWorkouts = searchQuery
    ? workouts.filter(w => 
        w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.category?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : workouts;

  const handleSelect = (workout: any) => {
    onAddWorkout(workout);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="mb-4">
          <DialogTitle>Add Workout for {selectedDay}</DialogTitle>
          <DialogClose className="absolute right-4 top-4">
            <X size={18} />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search your workouts..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hashim-600"></div>
          </div>
        ) : (
          <div className="space-y-3 max-h-[50vh] overflow-y-auto">
            {filteredWorkouts.length > 0 ? (
              filteredWorkouts.map((workout) => (
                <div
                  key={workout.id}
                  className="border rounded-lg p-4 cursor-pointer hover:border-hashim-300 transition-colors"
                  onClick={() => handleSelect(workout)}
                >
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-medium">{workout.title}</h3>
                    <span className="text-xs py-0.5 px-2 bg-hashim-100 text-hashim-800 rounded-full">
                      {workout.category}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {workout.exercises?.length || 0} exercises
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No workouts found</p>
                <Button
                  variant="outline"
                  className="flex items-center mx-auto"
                >
                  <Plus size={16} className="mr-1" />
                  Create new workout
                </Button>
              </div>
            )}
          </div>
        )}
        
        <div className="flex justify-end mt-4 space-x-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button 
            variant="default"
            className="bg-hashim-600 hover:bg-hashim-700 text-white"
            onClick={() => onClose()}
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
