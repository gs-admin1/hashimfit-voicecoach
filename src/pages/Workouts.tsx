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
import { AICoachBanner } from "@/components/AICoachBanner";
import { PostWorkoutFeedbackModal } from "@/components/PostWorkoutFeedbackModal";
import { WorkoutCardImproved } from "@/components/WorkoutCardImproved";
import { Plus, MessageCircle, Dumbbell, ArrowUpDown, Play, Sparkles } from "lucide-react";
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
  
  // Helper function to convert string superset IDs to UUIDs or null
  const convertSupersetId = (supersetId: string | null | undefined): string | null => {
    if (!supersetId) return null;
    
    // If it's already a UUID format, return it
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(supersetId)) {
      return supersetId;
    }
    
    // If it's a string-based ID, convert it to null (we'll let the database handle grouping differently)
    return null;
  };
  
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
      
      // Prepare exercise logs with proper superset ID handling
      const exerciseLogs = exercises.map((ex, index) => ({
        exercise_name: ex.name,
        sets_completed: ex.sets,
        reps_completed: ex.reps,
        weight_used: ex.weight,
        rest_time: ex.rest_seconds || 60,
        order_index: index,
        superset_group_id: convertSupersetId(ex.superset_group_id), // Convert to proper UUID or null
        rest_seconds: ex.rest_seconds || 60,
        position_in_workout: index,
        notes: ""
      }));
      
      console.log("Exercise logs prepared:", exerciseLogs);
      
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
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-indigo-50 to-slate-50 dark:from-gray-900 dark:via-indigo-900/20 dark:to-gray-800">
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-violet-200/30 dark:border-violet-700/30 sticky top-0 z-10 animate-fade-in">
          <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
            <Button 
              variant="ghost" 
              onClick={() => setView("list")}
              className="flex items-center text-violet-700 hover:text-violet-800 hover:bg-violet-50"
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
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-indigo-50 to-slate-50 dark:from-gray-900 dark:via-indigo-900/20 dark:to-gray-800">
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-violet-200/30 dark:border-violet-700/30 sticky top-0 z-10 animate-fade-in">
          <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
            <Button 
              variant="ghost" 
              onClick={() => setView("list")}
              className="flex items-center text-violet-700 hover:text-violet-800 hover:bg-violet-50"
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
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-indigo-50 to-slate-50 dark:from-gray-900 dark:via-indigo-900/20 dark:to-gray-800">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-violet-200/30 dark:border-violet-700/30 sticky top-0 z-10 animate-fade-in">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <Logo />
          <div className="flex items-center space-x-2">
            <Button 
              size="sm" 
              variant="ghost"
              className="flex items-center text-violet-700 hover:text-violet-800 hover:bg-violet-50"
            >
              <MessageCircle size={16} className="mr-1" />
              Ask Coach
            </Button>
            <Button 
              size="sm" 
              className="flex items-center bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg"
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
      
      <main className="pt-6 px-4 animate-fade-in pb-20">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Modern Section Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-700 to-indigo-700 bg-clip-text text-transparent">
              {format(selectedDate, "EEEE, MMM d")}
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-sm">
              Your training schedule
            </p>
          </div>
          
          <WorkoutFilters
            activeFilters={activeFilters}
            onFiltersChange={setActiveFilters}
          />

          {/* AI Coach Banner - positioned above workouts */}
          {filteredWorkouts.length > 0 && (
            <div className="bg-gradient-to-r from-indigo-100 to-violet-100 dark:from-indigo-900/50 dark:to-violet-900/50 backdrop-blur-xl border border-indigo-200/50 dark:border-indigo-700/50 rounded-2xl p-4 shadow-lg animate-fade-in">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-indigo-800 dark:text-indigo-200 text-sm">
                    AI Coach Insight
                  </h4>
                  <p className="text-indigo-700 dark:text-indigo-300 text-xs">
                    {filteredWorkouts[0]?.difficulty > 6 
                      ? "High intensity session ahead! Stay hydrated and focus on form."
                      : "Perfect training intensity for steady progress. You've got this! 💪"
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {isLoadingScheduled ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredWorkouts.length > 0 ? (
                filteredWorkouts.map((workout, index) => (
                  <WorkoutCardImproved
                    key={`${workout.schedule_id}-${workout.id}` || index}
                    workout={workout}
                    onStart={startWorkoutSession}
                    onAskCoach={() => {}}
                    onReplaceWorkout={() => {}}
                    onSaveAsFavorite={saveAsFavorite}
                    isToday={format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')}
                  />
                ))
              ) : (
                <AnimatedCard className="text-center py-12 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-white/40 dark:border-slate-700/40 shadow-lg">
                  <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/50 dark:to-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Dumbbell className="h-10 w-10 text-violet-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                    {activeFilters.length > 0 
                      ? "No workouts match your filters"
                      : `No workouts for ${format(selectedDate, "MMM d")}`
                    }
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm">
                    {activeFilters.length > 0 
                      ? "Try adjusting your filters or add a new workout"
                      : "Ready to plan your next training session?"
                    }
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => activeFilters.length > 0 ? setActiveFilters([]) : setShowAddWorkout(true)}
                    className="border-violet-300 text-violet-700 hover:bg-violet-50 dark:border-violet-600 dark:text-violet-300 dark:hover:bg-violet-900/30"
                  >
                    {activeFilters.length > 0 ? (
                      "Clear Filters"
                    ) : (
                      <>
                        <Plus size={16} className="mr-2" />
                        Schedule Workout
                      </>
                    )}
                  </Button>
                </AnimatedCard>
              )}
            </div>
          )}

          {/* Mobile Action Bar - Fixed at bottom on mobile */}
          <div className="fixed bottom-20 left-0 right-0 md:hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-t border-violet-200/30 dark:border-violet-700/30 p-4 z-20">
            <div className="max-w-lg mx-auto flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {}}
                className="flex-1 border-violet-300 text-violet-700 hover:bg-violet-50"
              >
                <MessageCircle size={14} className="mr-1" />
                Ask Coach
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {}}
                className="flex-1 border-violet-300 text-violet-700 hover:bg-violet-50"
              >
                <ArrowUpDown size={14} className="mr-1" />
                Replace
              </Button>
              {filteredWorkouts.length > 0 && !filteredWorkouts[0]?.isCompleted && (
                <Button
                  size="sm"
                  onClick={() => startWorkoutSession(filteredWorkouts[0])}
                  className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white"
                >
                  <Play size={14} className="mr-1" />
                  Start
                </Button>
              )}
            </div>
          </div>
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
