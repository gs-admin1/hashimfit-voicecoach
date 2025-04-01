
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatedCard } from "@/components/ui-components";
import { X, Plus, Search, Filter } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { WorkoutService, WorkoutPlan } from "@/lib/supabase/services/WorkoutService";

interface AddWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWorkout: (workout: any) => void;
  selectedDay: string;
}

export function AddWorkoutModal({ isOpen, onClose, onAddWorkout, selectedDay }: AddWorkoutModalProps) {
  const [workouts, setWorkouts] = useState<WorkoutPlan[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { userId } = useAuth();

  // Fetch workouts when modal is opened
  useEffect(() => {
    if (isOpen && userId) {
      fetchWorkouts();
    }
  }, [isOpen, userId]);

  const fetchWorkouts = async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      const workoutPlans = await WorkoutService.getWorkoutPlans(userId);
      setWorkouts(workoutPlans);
    } catch (error) {
      console.error("Error fetching workouts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter workouts based on search query
  const filteredWorkouts = searchQuery 
    ? workouts.filter(workout => 
        workout.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : workouts;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Add workout to {selectedDay}
          </DialogTitle>
          <DialogClose className="absolute right-4 top-4">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search workouts"
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hashim-600"></div>
            </div>
          ) : filteredWorkouts.length > 0 ? (
            <div className="space-y-2 max-h-[50vh] overflow-y-auto">
              {filteredWorkouts.map((workout) => (
                <AnimatedCard key={workout.id} className="p-3 hover:bg-muted/50 cursor-pointer"
                  onClick={() => {
                    onAddWorkout(workout);
                    onClose();
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{workout.title}</h3>
                      <p className="text-xs text-muted-foreground capitalize">{workout.category}</p>
                    </div>
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No workouts found</p>
              <Button 
                variant="outline" 
                className="mt-2"
                onClick={() => {
                  // This could navigate to create a new workout
                  onClose();
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create New Workout
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
