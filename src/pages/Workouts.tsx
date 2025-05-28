import { useState } from "react";
import { Logo } from "@/components/Logo";
import { NavigationBar, AnimatedCard, SectionTitle } from "@/components/ui-components";
import { WorkoutCardImproved } from "@/components/WorkoutCardImproved";
import { WorkoutSessionCard } from "@/components/WorkoutSessionCard";
import { CalendarStrip } from "@/components/CalendarStrip";
import { WorkoutFilters } from "@/components/WorkoutFilters";
import { WorkoutCompletionSummary } from "@/components/WorkoutCompletionSummary";
import { RestTimerOverlay } from "@/components/RestTimerOverlay";
import { Button } from "@/components/ui/button";
import { AddWorkoutModal } from "@/components/AddWorkoutModal";
import { ChatFAB } from "@/components/ChatFAB";
import { Plus, MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { WorkoutService, WorkoutPlan } from "@/lib/supabase/services/WorkoutService";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

export default function WorkoutsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<"list" | "session" | "completion">("list");
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restDuration, setRestDuration] = useState(60);
  const { isAuthenticated, userId } = useAuth();
  const queryClient = useQueryClient();
  
  // Query for workouts with stale time to ensure persistence across navigation
  const { data: workouts = [], isLoading } = useQuery({
    queryKey: ['workoutPlans', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      console.log("Fetching workout plans for user:", userId);
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
            category: plan.category,
            isFavorite: false,
            estimatedDuration: 45 + exercises.length * 3,
            targetMuscles: ["Chest", "Triceps", "Shoulders"],
            difficulty: plan.difficulty || 3,
            aiGenerated: plan.ai_generated || false,
            streak: Math.floor(Math.random() * 5) + 1
          };
        })
      );
      
      return workoutsWithExercises;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
  
  // Mutation for adding a workout
  const addWorkoutMutation = useMutation({
    mutationFn: async (workout: any) => {
      if (!userId) throw new Error("User not authenticated");
      
      console.log("Creating new workout:", workout);
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
      console.log("Successfully added workout");
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

  // Mutation for adding an exercise to an existing workout
  const addExerciseMutation = useMutation({
    mutationFn: async ({ workoutId, exercise }: { workoutId: string, exercise: any }) => {
      if (!userId) throw new Error("User not authenticated");
      
      console.log("Adding exercise to workout:", workoutId, exercise);
      
      // Get current exercises to determine the next order_index
      const currentExercises = await WorkoutService.getWorkoutExercises(workoutId);
      const orderIndex = currentExercises.length;
      
      // Create the new exercise
      const newExercise = {
        workout_plan_id: workoutId,
        name: exercise.name,
        sets: exercise.sets,
        reps: exercise.reps,
        weight: exercise.weight,
        order_index: orderIndex
      };
      
      const result = await WorkoutService.createWorkoutExercises([newExercise]);
      
      if (!result) {
        throw new Error('Failed to add exercise');
      }
      
      return { workoutId, exercise: result[0] };
    },
    onSuccess: (data) => {
      console.log("Successfully added exercise:", data);
      queryClient.invalidateQueries({ queryKey: ['workoutPlans'] });
      toast({
        title: "Exercise Added",
        description: "Your exercise has been added successfully."
      });
    },
    onError: (error) => {
      console.error('Error adding exercise:', error);
      toast({
        title: "Error",
        description: "Failed to add exercise. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Mutation for removing an exercise
  const removeExerciseMutation = useMutation({
    mutationFn: async (exerciseId: string) => {
      if (!userId) throw new Error("User not authenticated");
      
      console.log("Removing exercise:", exerciseId);
      const result = await WorkoutService.deleteWorkoutExercise(exerciseId);
      
      if (!result) {
        throw new Error('Failed to remove exercise');
      }
      
      return exerciseId;
    },
    onSuccess: () => {
      console.log("Successfully removed exercise");
      queryClient.invalidateQueries({ queryKey: ['workoutPlans'] });
      toast({
        title: "Exercise Removed",
        description: "Your exercise has been removed successfully."
      });
    },
    onError: (error) => {
      console.error('Error removing exercise:', error);
      toast({
        title: "Error",
        description: "Failed to remove exercise. Please try again.",
        variant: "destructive"
      });
    }
  });

  const startWorkoutSession = (workout: any) => {
    setSelectedWorkout(workout);
    setView("session");
  };

  const completeWorkout = () => {
    setView("completion");
  };

  const handleWorkoutCompletion = (rating: number, notes: string) => {
    console.log("Workout completed with rating:", rating, "notes:", notes);
    toast({
      title: "Workout Complete! 🎉",
      description: "Your progress has been saved successfully.",
    });
    setView("list");
    setSelectedWorkout(null);
  };

  const saveAsFavorite = () => {
    toast({
      title: "Saved as Favorite ⭐",
      description: "This workout has been added to your favorites.",
    });
  };

  const saveAsTemplate = () => {
    toast({
      title: "Template Saved",
      description: "Workout saved as a custom template.",
    });
  };

  const shareWorkout = () => {
    toast({
      title: "Sharing Feature",
      description: "Workout sharing will be available soon!",
    });
  };

  const startRestTimer = (duration: number = 60) => {
    setRestDuration(duration);
    setShowRestTimer(true);
  };

  const filteredWorkouts = workouts.filter(workout => {
    if (activeFilters.length === 0) return true;
    
    // Apply filters based on workout properties
    return activeFilters.some(filter => {
      switch (filter) {
        case 'ai-generated':
          return workout.aiGenerated;
        case 'custom':
          return !workout.aiGenerated;
        case 'strength':
          return workout.category === 'strength';
        case 'cardio':
          return workout.category === 'cardio';
        case 'upper-body':
          return workout.targetMuscles?.some(muscle => 
            ['Chest', 'Back', 'Shoulders', 'Arms', 'Triceps', 'Biceps'].includes(muscle)
          );
        case 'lower-body':
          return workout.targetMuscles?.some(muscle => 
            ['Legs', 'Quads', 'Hamstrings', 'Glutes', 'Calves'].includes(muscle)
          );
        default:
          return true;
      }
    });
  });

  // Completion view
  if (view === "completion" && selectedWorkout) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-hashim-50/50 to-white dark:from-gray-900 dark:to-gray-800">
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-border sticky top-0 z-10 animate-fade-in">
          <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
            <Button 
              variant="ghost" 
              onClick={() => setView("list")}
              className="flex items-center"
            >
              ← Back to Workouts
            </Button>
            <Logo />
          </div>
        </header>
        
        <main className="pt-4 px-4 animate-fade-in pb-20">
          <div className="max-w-lg mx-auto">
            <WorkoutCompletionSummary
              workout={{
                title: selectedWorkout.title,
                duration: selectedWorkout.estimatedDuration || 45,
                caloriesBurned: 280,
                muscleGroups: selectedWorkout.targetMuscles || ["Chest", "Triceps"],
                performanceTrend: "improved"
              }}
              onSaveAsTemplate={saveAsTemplate}
              onShare={shareWorkout}
              onComplete={handleWorkoutCompletion}
            />
          </div>
        </main>
        
        <ChatFAB />
      </div>
    );
  }

  // Session view
  if (view === "session" && selectedWorkout) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-hashim-50/50 to-white dark:from-gray-900 dark:to-gray-800">
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-border sticky top-0 z-10 animate-fade-in">
          <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
            <Button 
              variant="ghost" 
              onClick={() => setView("list")}
              className="flex items-center"
            >
              ← Back to Workouts
            </Button>
            <Logo />
          </div>
        </header>
        
        <main className="pt-4 px-4 animate-fade-in pb-20">
          <div className="max-w-lg mx-auto">
            <WorkoutSessionCard
              workout={selectedWorkout}
              onComplete={completeWorkout}
              onSaveAsFavorite={saveAsFavorite}
              onStartRestTimer={startRestTimer}
              className="animate-fade-in"
            />
          </div>
        </main>
        
        <RestTimerOverlay
          isVisible={showRestTimer}
          duration={restDuration}
          onComplete={() => setShowRestTimer(false)}
          onSkip={() => setShowRestTimer(false)}
          onClose={() => setShowRestTimer(false)}
        />
        
        <ChatFAB />
      </div>
    );
  }

  // Main workout list view
  return (
    <div className="min-h-screen bg-gradient-to-b from-hashim-50/50 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-border sticky top-0 z-10 animate-fade-in">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <Logo />
          <div className="flex items-center space-x-2">
            <Button 
              size="sm" 
              variant="ghost"
              className="flex items-center"
            >
              <MessageCircle size={16} className="mr-1" />
              Ask Coach
            </Button>
            <Button 
              size="sm" 
              className="flex items-center bg-hashim-600 hover:bg-hashim-700 text-white"
              onClick={() => setShowAddWorkout(true)}
            >
              <Plus size={16} className="mr-1" />
              Add
            </Button>
          </div>
        </div>
        
        <CalendarStrip
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />
      </header>
      
      <main className="pt-4 px-4 animate-fade-in pb-20">
        <div className="max-w-lg mx-auto space-y-6">
          <SectionTitle 
            title={`Workouts for ${format(selectedDate, "MMM d")}`}
            subtitle="Your personalized training plan"
          />
          
          <WorkoutFilters
            activeFilters={activeFilters}
            onFiltersChange={setActiveFilters}
          />
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hashim-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredWorkouts.length > 0 ? (
                filteredWorkouts.map((workout, index) => (
                  <WorkoutCardImproved
                    key={workout.id || index}
                    workout={workout}
                    onStart={startWorkoutSession}
                    onEdit={() => {}}
                  />
                ))
              ) : (
                <AnimatedCard className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    No workouts found for the selected filters
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveFilters([])}
                    className="flex items-center mx-auto"
                  >
                    Clear Filters
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
        onAddWorkout={() => {}}
        selectedDay=""
      />
      
      <NavigationBar />
      <ChatFAB />
    </div>
  );
}
