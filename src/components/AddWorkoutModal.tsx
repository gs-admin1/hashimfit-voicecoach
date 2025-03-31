
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Dumbbell, X, Plus, Save } from "lucide-react";
import { AnimatedCard } from "./ui-components";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { WorkoutService } from "@/lib/supabase/services/WorkoutService";

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  weight?: string;
}

interface Workout {
  id?: string;
  title: string;
  category: string;
  exercises: Exercise[];
}

interface AddWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWorkout: (workout: Workout) => void;
  selectedDay: string;
}

export function AddWorkoutModal({ isOpen, onClose, onAddWorkout, selectedDay }: AddWorkoutModalProps) {
  const { userId } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("browse");
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // State for custom workout creation
  const [newWorkoutTitle, setNewWorkoutTitle] = useState("");
  const [newWorkoutCategory, setNewWorkoutCategory] = useState("strength");
  const [newWorkoutExercises, setNewWorkoutExercises] = useState<Exercise[]>([]);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [newExerciseSets, setNewExerciseSets] = useState("3");
  const [newExerciseReps, setNewExerciseReps] = useState("10");
  const [newExerciseWeight, setNewExerciseWeight] = useState("");

  // Fetch workouts when modal is opened
  useEffect(() => {
    if (isOpen && userId) {
      fetchWorkouts();
    }
  }, [isOpen, userId]);

  const fetchWorkouts = async () => {
    setIsLoading(true);
    try {
      // Fetch user's custom workouts from the database
      const userWorkouts = await WorkoutService.getWorkoutPlans(userId!);
      
      // Fetch preset workouts (these could be stored in the database with a special flag)
      const presetWorkouts = [
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
      ];
      
      // Transform user workout plans to the expected format
      const formattedUserWorkouts = userWorkouts.map(async plan => {
        const exercises = await WorkoutService.getWorkoutExercises(plan.id!);
        return {
          id: plan.id,
          title: plan.title,
          category: plan.category,
          exercises: exercises.map(ex => ({
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight
          }))
        };
      });
      
      const resolvedUserWorkouts = await Promise.all(formattedUserWorkouts);
      
      // Combine preset and user workouts
      setWorkouts([...presetWorkouts, ...resolvedUserWorkouts]);
    } catch (error) {
      console.error("Error fetching workouts:", error);
      toast({
        title: "Error",
        description: "Failed to load workouts",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

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
    resetForm();
  };

  const handleAddExerciseToForm = () => {
    if (newExerciseName.trim() === "") {
      toast({
        title: "Error",
        description: "Exercise name is required",
        variant: "destructive"
      });
      return;
    }

    const exercise: Exercise = {
      name: newExerciseName,
      sets: parseInt(newExerciseSets) || 3,
      reps: newExerciseReps || "10",
      weight: newExerciseWeight || undefined
    };

    setNewWorkoutExercises([...newWorkoutExercises, exercise]);
    
    // Reset exercise form fields
    setNewExerciseName("");
    setNewExerciseSets("3");
    setNewExerciseReps("10");
    setNewExerciseWeight("");
  };

  const handleRemoveExercise = (index: number) => {
    setNewWorkoutExercises(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateWorkout = async () => {
    if (newWorkoutTitle.trim() === "") {
      toast({
        title: "Error",
        description: "Workout title is required",
        variant: "destructive"
      });
      return;
    }

    if (newWorkoutExercises.length === 0) {
      toast({
        title: "Error",
        description: "Add at least one exercise to your workout",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const newWorkout: Workout = {
        title: newWorkoutTitle,
        category: newWorkoutCategory,
        exercises: newWorkoutExercises
      };

      // If adding directly to a day's workout
      if (selectedDay) {
        onAddWorkout(newWorkout);
        toast({
          title: "Workout Added",
          description: `${newWorkout.title} added to ${selectedDay}'s workout plan`,
        });
        onClose();
      } 
      // If creating a custom workout to save in database
      else {
        // Create workout plan in the database
        const workoutPlan = {
          user_id: userId!,
          title: newWorkout.title,
          category: newWorkout.category,
          difficulty: 3
        };
        
        const createdPlan = await WorkoutService.createWorkoutPlan(workoutPlan);
        
        if (!createdPlan || !createdPlan.id) {
          throw new Error("Failed to create workout plan");
        }
        
        // Add exercises to the workout plan
        const exercises = newWorkout.exercises.map((ex, index) => ({
          workout_plan_id: createdPlan.id!,
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
          order_index: index
        }));
        
        await WorkoutService.createWorkoutExercises(exercises);
        
        // Update local state with the new workout
        setWorkouts([...workouts, { ...newWorkout, id: createdPlan.id }]);
        
        toast({
          title: "Workout Created",
          description: `${newWorkout.title} has been created and saved`,
        });
        
        // Reset form
        resetForm();
        
        // Switch to browse tab to show the newly created workout
        setActiveTab("browse");
      }
    } catch (error) {
      console.error("Error creating workout:", error);
      toast({
        title: "Error",
        description: "Failed to create workout",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setNewWorkoutTitle("");
    setNewWorkoutCategory("strength");
    setNewWorkoutExercises([]);
    setNewExerciseName("");
    setNewExerciseSets("3");
    setNewExerciseReps("10");
    setNewExerciseWeight("");
    setSearchTerm("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        resetForm();
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {selectedDay ? `Add Workout for ${selectedDay}` : "Create Workout"}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="browse" className="flex-1">Browse</TabsTrigger>
            <TabsTrigger value="create" className="flex-1">Create</TabsTrigger>
          </TabsList>
          
          <TabsContent value="browse">
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
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hashim-600"></div>
                </div>
              ) : filteredWorkouts.length > 0 ? (
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
          </TabsContent>
          
          <TabsContent value="create">
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-sm mb-1">Workout Title</label>
                <Input
                  placeholder="e.g., Core Strength"
                  value={newWorkoutTitle}
                  onChange={(e) => setNewWorkoutTitle(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm mb-1">Category</label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={newWorkoutCategory}
                  onChange={(e) => setNewWorkoutCategory(e.target.value)}
                >
                  <option value="strength">Strength</option>
                  <option value="cardio">Cardio</option>
                  <option value="hiit">HIIT</option>
                  <option value="recovery">Recovery</option>
                  <option value="sport_specific">Sport Specific</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Exercises</h3>
                </div>
                
                {newWorkoutExercises.length > 0 ? (
                  <div className="space-y-3 mb-4">
                    {newWorkoutExercises.map((exercise, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-md"
                      >
                        <div>
                          <p className="font-medium">{exercise.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {exercise.sets} sets × {exercise.reps} {exercise.weight ? `@ ${exercise.weight}` : ''}
                          </p>
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleRemoveExercise(index)}
                          className="h-8 w-8"
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-4 mb-4 border border-dashed rounded-md">
                    <p className="text-muted-foreground">No exercises added yet</p>
                  </div>
                )}
                
                <div className="space-y-3 p-3 border rounded-md">
                  <h4 className="text-sm font-medium">Add Exercise</h4>
                  
                  <div className="space-y-2">
                    <Input 
                      placeholder="Exercise name"
                      value={newExerciseName}
                      onChange={(e) => setNewExerciseName(e.target.value)}
                    />
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-xs block mb-1">Sets</label>
                        <Input 
                          type="number" 
                          min="1" 
                          placeholder="Sets"
                          value={newExerciseSets}
                          onChange={(e) => setNewExerciseSets(e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label className="text-xs block mb-1">Reps</label>
                        <Input 
                          placeholder="e.g., 8-10"
                          value={newExerciseReps}
                          onChange={(e) => setNewExerciseReps(e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label className="text-xs block mb-1">Weight (opt.)</label>
                        <Input 
                          placeholder="e.g., 50kg"
                          value={newExerciseWeight}
                          onChange={(e) => setNewExerciseWeight(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleAddExerciseToForm}
                      className="w-full flex items-center justify-center"
                      type="button"
                      variant="outline"
                    >
                      <Plus size={16} className="mr-1" />
                      Add Exercise
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex items-center justify-between">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          {activeTab === "create" && (
            <Button 
              onClick={handleCreateWorkout}
              disabled={isLoading}
              className="flex items-center bg-hashim-600 hover:bg-hashim-700"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white mr-2"></div>
              ) : (
                <Save size={16} className="mr-1" />
              )}
              {selectedDay ? `Add to ${selectedDay}` : "Save Workout"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
