
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { NavigationBar, AnimatedCard, SectionTitle, Chip } from "@/components/ui-components";
import { WorkoutCard } from "@/components/WorkoutCard";
import { Button } from "@/components/ui/button";
import { AddWorkoutModal } from "@/components/AddWorkoutModal";
import { ChatFAB } from "@/components/ChatFAB";
import { Plus, Filter, ArrowUpDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { WorkoutService, WorkoutPlan } from "@/lib/supabase/services/WorkoutService";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function WorkoutsPage() {
  const [filter, setFilter] = useState("all");
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const { isAuthenticated, userId } = useAuth();
  const [selectedDay, setSelectedDay] = useState('Today');
  const queryClient = useQueryClient();
  
  // Query for workouts
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
            exercises: exercises.map(ex => ({
              id: ex.id,
              name: ex.name,
              sets: ex.sets,
              reps: ex.reps,
              weight: ex.weight || 'bodyweight'
            })),
            category: plan.category
          };
        })
      );
      
      return workoutsWithExercises;
    },
    enabled: !!userId,
  });
  
  // Mutation for adding a workout
  const addWorkoutMutation = useMutation({
    mutationFn: async (workout: any) => {
      if (!userId) throw new Error("User not authenticated");
      
      // Create workout plan in Supabase
      const workoutPlan: WorkoutPlan = {
        user_id: userId,
        title: workout.title,
        category: workout.category || 'strength',
        difficulty: 3
      };
      
      const createdPlan = await WorkoutService.createWorkoutPlan(workoutPlan);
      
      if (!createdPlan || !createdPlan.id) {
        throw new Error('Failed to create workout plan');
      }
      
      // Create exercises
      const exercises = workout.exercises.map((ex: any, index: number) => ({
        workout_plan_id: createdPlan.id!,
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        order_index: index
      }));
      
      await WorkoutService.createWorkoutExercises(exercises);
      
      return createdPlan.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workoutPlans'] });
      toast({
        title: "Workout Added",
        description: "Your workout has been added successfully."
      });
    },
    onError: (error) => {
      console.error('Error adding workout:', error);
      toast({
        title: "Error",
        description: "Failed to add workout. Please try again.",
        variant: "destructive"
      });
    }
  });

  const addWorkout = (workout: any) => {
    if (!userId) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add workouts.",
        variant: "destructive"
      });
      return;
    }
    
    addWorkoutMutation.mutate(workout);
    setShowAddWorkout(false);
  };

  const filteredWorkouts = filter === "all" 
    ? workouts 
    : workouts.filter(workout => workout.category === filter);

  return (
    <div className="min-h-screen bg-gradient-to-b from-hashim-50/50 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-border sticky top-0 z-10 animate-fade-in">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <Logo />
          <Button size="sm" variant="ghost" className="flex items-center">
            <Filter size={16} className="mr-2" />
            Filter
          </Button>
        </div>
      </header>
      
      <main className="pt-4 px-4 animate-fade-in pb-20">
        <div className="max-w-lg mx-auto">
          <SectionTitle 
            title="Workouts" 
            subtitle="Browse all workout programs" 
            action={
              <Button 
                size="sm" 
                className="flex items-center bg-hashim-600 hover:bg-hashim-700 text-white"
                onClick={() => setShowAddWorkout(true)}
              >
                <Plus size={16} className="mr-1" />
                Add
              </Button>
            }
          />
          
          <div className="flex space-x-3 mb-6 overflow-x-auto pb-2 scrollbar-none">
            <Chip 
              label="All" 
              active={filter === "all"}
              onClick={() => setFilter("all")}
            />
            <Chip 
              label="Strength" 
              active={filter === "strength"}
              onClick={() => setFilter("strength")}
            />
            <Chip 
              label="Cardio" 
              active={filter === "cardio"}
              onClick={() => setFilter("cardio")}
            />
            <Chip 
              label="Recovery" 
              active={filter === "recovery"}
              onClick={() => setFilter("recovery")}
            />
          </div>
          
          {isLoading || addWorkoutMutation.isPending ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hashim-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredWorkouts.length > 0 ? (
                filteredWorkouts.map((workout, index) => (
                  <WorkoutCard key={workout.id || index} workout={workout} editable={true} />
                ))
              ) : (
                <AnimatedCard className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No workouts found</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAddWorkout(true)}
                    className="flex items-center mx-auto"
                  >
                    <Plus size={16} className="mr-1" />
                    Add your first workout
                  </Button>
                </AnimatedCard>
              )}
            </div>
          )}
        </div>
      </main>
      
      <AddWorkoutModal 
        isOpen={showAddWorkout} 
        onClose={() => setShowAddWorkout(false)}
        onAddWorkout={addWorkout}
        selectedDay=""
      />
      
      <NavigationBar />
      <ChatFAB />
    </div>
  );
}
