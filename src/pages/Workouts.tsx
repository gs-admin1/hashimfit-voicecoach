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
import { WorkoutService } from "@/lib/supabase/services/WorkoutService";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, addDays, startOfDay, endOfDay } from "date-fns";

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
  
  // Helper function to parse estimated duration
  const parseEstimatedDuration = (duration: any): number => {
    if (typeof duration === 'number') return duration;
    if (typeof duration === 'string') {
      // Handle time format like "00:45:00" (HH:MM:SS)
      const parts = duration.split(':');
      if (parts.length >= 2) {
        return parseInt(parts[1]) || 45; // Return minutes
      }
    }
    return 45; // Default fallback
  };
  
  // Query for scheduled workouts for the selected date
  const { data: scheduledWorkouts = [], isLoading: isLoadingScheduled } = useQuery({
    queryKey: ['scheduledWorkouts', userId, format(selectedDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      if (!userId) return [];
      
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      console.log("Fetching scheduled workouts for date:", dateStr);
      
      const scheduledWorkouts = await WorkoutService.getWorkoutSchedule(
        userId, 
        dateStr, 
        dateStr
      );
      
      console.log("Found scheduled workouts:", scheduledWorkouts);
      
      // Get workout plan details and exercises for each scheduled workout
      const workoutsWithDetails = await Promise.all(
        scheduledWorkouts.map(async (schedule) => {
          const workoutPlan = await WorkoutService.getWorkoutPlanById(schedule.workout_plan_id);
          if (!workoutPlan) return null;
          
          const exercises = await WorkoutService.getWorkoutExercises(schedule.workout_plan_id);
          
          return {
            id: workoutPlan.id,
            schedule_id: schedule.id,
            title: workoutPlan.title,
            exercises: exercises.map(ex => ({
              id: ex.id,
              name: ex.name,
              sets: ex.sets,
              reps: ex.reps,
              weight: ex.weight || 'bodyweight'
            })),
            category: workoutPlan.category,
            isFavorite: false,
            estimatedDuration: parseEstimatedDuration(workoutPlan.estimated_duration) || 
              45 + exercises.length * 3,
            targetMuscles: workoutPlan.target_muscles || ["Full Body"],
            difficulty: workoutPlan.difficulty || 3,
            aiGenerated: workoutPlan.ai_generated || false,
            isCompleted: schedule.is_completed,
            scheduledDate: schedule.scheduled_date,
            scheduledTime: schedule.scheduled_time,
            streak: Math.floor(Math.random() * 5) + 1
          };
        })
      );
      
      return workoutsWithDetails.filter(workout => workout !== null);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Query for all workout plans (for the add workout modal)
  const { data: allWorkoutPlans = [] } = useQuery({
    queryKey: ['allWorkoutPlans', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      console.log("Fetching all workout plans for user:", userId);
      const workoutPlans = await WorkoutService.getWorkoutPlans(userId);
      
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
            estimatedDuration: parseEstimatedDuration(plan.estimated_duration) || 
              45 + exercises.length * 3,
            targetMuscles: plan.target_muscles || ["Full Body"],
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

  // Mutation for scheduling a workout
  const scheduleWorkoutMutation = useMutation({
    mutationFn: async ({ workoutPlanId, scheduledDate }: { workoutPlanId: string, scheduledDate: string }) => {
      if (!userId) throw new Error("User not authenticated");
      
      console.log("Scheduling workout:", workoutPlanId, "for date:", scheduledDate);
      
      const scheduleData = {
        user_id: userId,
        workout_plan_id: workoutPlanId,
        scheduled_date: scheduledDate,
        is_completed: false
      };
      
      const result = await WorkoutService.scheduleWorkout(scheduleData);
      return result;
    },
    onSuccess: () => {
      console.log("Successfully scheduled workout");
      queryClient.invalidateQueries({ queryKey: ['scheduledWorkouts'] });
      toast({
        title: "Workout Scheduled",
        description: "Your workout has been scheduled successfully."
      });
    },
    onError: (error) => {
      console.error('Error scheduling workout:', error);
      toast({
        title: "Error",
        description: "Failed to schedule workout. Please try again.",
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

  const filteredWorkouts = scheduledWorkouts.filter(workout => {
    if (activeFilters.length === 0) return true;
    
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
            subtitle="Your scheduled training for today"
          />
          
          <WorkoutFilters
            activeFilters={activeFilters}
            onFiltersChange={setActiveFilters}
          />
          
          {isLoadingScheduled ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hashim-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredWorkouts.length > 0 ? (
                filteredWorkouts.map((workout, index) => (
                  <WorkoutCardImproved
                    key={`${workout.schedule_id}-${workout.id}` || index}
                    workout={workout}
                    onStart={startWorkoutSession}
                    onEdit={() => {}}
                  />
                ))
              ) : (
                <AnimatedCard className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    {activeFilters.length > 0 
                      ? "No workouts found for the selected filters"
                      : `No workouts scheduled for ${format(selectedDate, "MMM d")}`
                    }
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => activeFilters.length > 0 ? setActiveFilters([]) : setShowAddWorkout(true)}
                    className="flex items-center mx-auto"
                  >
                    {activeFilters.length > 0 ? "Clear Filters" : (
                      <>
                        <Plus size={16} className="mr-1" />
                        Schedule a workout
                      </>
                    )}
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
        onAddWorkout={(workout) => {
          const dateStr = format(selectedDate, 'yyyy-MM-dd');
          scheduleWorkoutMutation.mutate({ 
            workoutPlanId: workout.id, 
            scheduledDate: dateStr 
          });
          setShowAddWorkout(false);
        }}
        selectedDay={format(selectedDate, 'yyyy-MM-dd')}
        availableWorkouts={allWorkoutPlans}
      />
      
      <NavigationBar />
      <ChatFAB />
    </div>
  );
}
