
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { NavigationBar, AnimatedCard, SectionTitle } from "@/components/ui-components";
import { WorkoutCard } from "@/components/WorkoutCard";
import { EnhancedWorkoutSessionCard } from "@/components/EnhancedWorkoutSessionCard";
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
  
  // Query for scheduled workouts for the selected date WITH voice-logged exercises
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
          
          // Get completed exercises and voice-logged exercises
          let completedExercises: Record<string, boolean> = {};
          let allExerciseLogs: any[] = [];
          
          if (schedule.is_completed && schedule.workout_log_id) {
            const exerciseLogs = await WorkoutService.getExerciseLogs(schedule.workout_log_id);
            allExerciseLogs = exerciseLogs;
            completedExercises = exerciseLogs.reduce((acc, log) => {
              acc[log.exercise_name] = true;
              return acc;
            }, {} as Record<string, boolean>);
          }
          
          // Combine planned exercises with logged exercises (including voice-logged ones)
          const plannedExercises = exercises.map(ex => ({
            id: ex.id!,
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight || 'bodyweight',
            completed: completedExercises[ex.name] || false,
            source: 'planned' as const,
            rest_seconds: 60,
            superset_group_id: ex.notes?.includes('Superset:') ? ex.notes.split('Superset: ')[1] : null,
            position_in_workout: exercises.findIndex(e => e.id === ex.id)
          }));

          // Add voice-logged exercises that aren't in the plan
          const voiceLoggedExercises = allExerciseLogs
            .filter(log => !exercises.some(ex => ex.name === log.exercise_name))
            .map(log => ({
              id: `voice-${log.id}`,
              name: log.exercise_name,
              sets: log.sets_completed,
              reps: log.reps_completed,
              weight: log.weight_used || 'bodyweight',
              completed: true,
              source: 'voice' as const,
              rest_seconds: 60,
              superset_group_id: log.superset_group_id || null,
              position_in_workout: allExerciseLogs.findIndex(l => l.id === log.id)
            }));
          
          const allExercises = [...plannedExercises, ...voiceLoggedExercises];
          
          return {
            id: workoutPlan.id,
            schedule_id: schedule.id,
            title: workoutPlan.title,
            exercises: allExercises,
            category: workoutPlan.category,
            isFavorite: false,
            estimatedDuration: parseEstimatedDuration(workoutPlan.estimated_duration) || 
              45 + allExercises.length * 3,
            targetMuscles: workoutPlan.target_muscles || ["Full Body"],
            difficulty: workoutPlan.difficulty || 3,
            aiGenerated: workoutPlan.ai_generated || false,
            isCompleted: schedule.is_completed,
            scheduledDate: schedule.scheduled_date,
            scheduledTime: schedule.scheduled_time,
            streak: Math.floor(Math.random() * 5) + 1,
            workout_log_id: schedule.workout_log_id
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

  // Mutation for updating workout exercises
  const updateWorkoutMutation = useMutation({
    mutationFn: async ({ workoutPlanId, exercises, applyToAll }: { workoutPlanId: string, exercises: any[], applyToAll: boolean }) => {
      if (!userId) throw new Error("User not authenticated");
      
      console.log("Updating workout exercises:", workoutPlanId, exercises, "Apply to all:", applyToAll);
      
      if (applyToAll) {
        // Update the workout plan template - this affects all future workouts
        const success = await WorkoutService.updateWorkoutPlanWithExercises(workoutPlanId, exercises);
        if (!success) throw new Error("Failed to update workout plan");
        return { type: 'update_template', workoutPlanId };
      } else {
        // Create a copy of the workout plan for this specific instance
        const newPlan = await WorkoutService.createWorkoutPlanCopy(workoutPlanId, exercises);
        if (!newPlan) throw new Error("Failed to create workout plan copy");
        
        // Update the schedule to use the new plan
        const selectedWorkoutSchedule = scheduledWorkouts.find(w => w.id === workoutPlanId);
        if (selectedWorkoutSchedule) {
          await WorkoutService.updateScheduledWorkout(selectedWorkoutSchedule.schedule_id, {
            workout_plan_id: newPlan.id
          });
        }
        
        return { type: 'create_copy', newPlanId: newPlan.id };
      }
    },
    onSuccess: (result) => {
      console.log("Successfully updated workout exercises");
      
      if (result.type === 'update_template') {
        // For template updates, invalidate ALL workout-related queries to ensure
        // that future occurrences of this workout show the updated exercises
        console.log("Invalidating all workout queries for template update");
        queryClient.invalidateQueries({ queryKey: ['scheduledWorkouts'] });
        queryClient.invalidateQueries({ queryKey: ['allWorkoutPlans'] });
        queryClient.invalidateQueries({ queryKey: ['workoutPlan'] });
        queryClient.invalidateQueries({ queryKey: ['workoutExercises'] });
        queryClient.invalidateQueries({ queryKey: ['weeklyWorkouts'] });
        queryClient.invalidateQueries({ queryKey: ['selectedWorkout'] });
        
        // Also remove all cached workout plan data to force fresh fetches
        queryClient.removeQueries({ queryKey: ['workoutPlan'] });
        queryClient.removeQueries({ queryKey: ['workoutExercises'] });
      } else {
        // Only invalidate current date queries for copy creation
        queryClient.invalidateQueries({ queryKey: ['scheduledWorkouts', userId, format(selectedDate, 'yyyy-MM-dd')] });
      }
      
      toast({
        title: "Workout Updated",
        description: result.type === 'update_template' 
          ? "Your workout has been updated for all future sessions."
          : "Your workout has been updated for today only."
      });
    },
    onError: (error) => {
      console.error('Error updating workout:', error);
      toast({
        title: "Error",
        description: "Failed to save workout changes. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Mutation for completing a workout
  const completeWorkoutMutation = useMutation({
    mutationFn: async ({ workoutData, exercises }: { workoutData: any, exercises: any[] }) => {
      if (!userId) throw new Error("User not authenticated");
      
      console.log("Completing workout:", workoutData.title, "with", exercises.length, "exercises");
      
      // Create workout log
      const workoutLog = {
        user_id: userId,
        workout_plan_id: workoutData.id,
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
        duration: workoutData.estimatedDuration * 60, // Convert minutes to seconds
        calories_burned: Math.round(workoutData.estimatedDuration * 5), // Rough estimate
        rating: 4, // Default rating
        notes: "Workout completed"
      };
      
      // Prepare exercise logs
      const exerciseLogs = exercises.map((ex, index) => ({
        exercise_name: ex.name,
        sets_completed: ex.sets,
        reps_completed: ex.reps,
        weight_used: ex.weight,
        rest_time: ex.rest_seconds || 60,
        order_index: index,
        superset_group_id: ex.superset_group_id || null,
        rest_seconds: ex.rest_seconds || 60,
        position_in_workout: index,
        notes: ""
      }));
      
      // Log the workout
      const workoutLogId = await WorkoutService.logWorkout(workoutLog, exerciseLogs);
      if (!workoutLogId) throw new Error("Failed to log workout");
      
      // Mark the scheduled workout as completed
      const selectedWorkoutSchedule = scheduledWorkouts.find(w => w.id === workoutData.id);
      if (selectedWorkoutSchedule) {
        await WorkoutService.completeScheduledWorkout(selectedWorkoutSchedule.schedule_id, workoutLogId);
      }
      
      return { workoutLogId, scheduleId: selectedWorkoutSchedule?.schedule_id };
    },
    onSuccess: (result) => {
      console.log("Successfully completed workout:", result);
      
      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['scheduledWorkouts'] });
      queryClient.invalidateQueries({ queryKey: ['workoutLogs'] });
      queryClient.invalidateQueries({ queryKey: ['recentWorkoutStats'] });
      
      toast({
        title: "Workout Completed! 🎉",
        description: "Your progress has been saved successfully.",
      });
    },
    onError: (error) => {
      console.error('Error completing workout:', error);
      toast({
        title: "Error",
        description: "Failed to complete workout. Please try again.",
        variant: "destructive"
      });
    }
  });

  const startWorkoutSession = (workout: any) => {
    setSelectedWorkout(workout);
    setView("session");
  };

  const completeWorkout = () => {
    if (selectedWorkout) {
      // Save the workout completion to database
      completeWorkoutMutation.mutate({
        workoutData: selectedWorkout,
        exercises: selectedWorkout.exercises
      });
    }
    setView("completion");
  };

  const handleWorkoutCompletion = (rating: number, notes: string) => {
    console.log("Workout completed with rating:", rating, "notes:", notes);
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

  const handleWorkoutUpdate = (updatedWorkout: any, applyToAll: boolean = false) => {
    updateWorkoutMutation.mutate({
      workoutPlanId: updatedWorkout.id,
      exercises: updatedWorkout.exercises,
      applyToAll
    });
  };

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

  // Session view - now using EnhancedWorkoutSessionCard
  if (view === "session" && selectedWorkout) {
    const enhancedWorkout = {
      id: selectedWorkout.id,
      title: selectedWorkout.title,
      exercises: selectedWorkout.exercises.map((ex: any, index: number) => ({
        ...ex,
        completed: ex.completed ? 1 : 0,
        rest_seconds: 60,
        position_in_workout: index,
        originalData: {
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
          rest_seconds: 60
        }
      })),
      category: selectedWorkout.category || 'strength',
      workout_log_id: selectedWorkout.workout_log_id
    };

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
            <EnhancedWorkoutSessionCard
              workout={enhancedWorkout}
              onComplete={completeWorkout}
              onSaveAsFavorite={saveAsFavorite}
              onStartRestTimer={startRestTimer}
              className="animate-fade-in"
            />
          </div>
        </main>
        
        <RestTimerOverlay />
        
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
                  <WorkoutCard
                    key={`${workout.schedule_id}-${workout.id}` || index}
                    workout={workout}
                    onStart={startWorkoutSession}
                    onAskCoach={() => {}}
                    onReplaceWorkout={() => {}}
                    onUpdateWorkout={handleWorkoutUpdate}
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
