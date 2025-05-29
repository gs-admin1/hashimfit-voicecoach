import { useState, useEffect } from "react";
import { format, startOfWeek, addDays } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { useUser } from "@/context/UserContext";
import { MealCaptureCard } from "@/components/MealCaptureCard";
import { WorkoutCard } from "@/components/WorkoutCard";
import { AddWorkoutModal } from "@/components/AddWorkoutModal";
import { VoiceInput } from "@/components/VoiceInput";
import { Button } from "@/components/ui/button";
import { DayTab } from "@/components/DayTab";
import { AnimatedCard } from "@/components/ui-components";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { WorkoutService, WorkoutSchedule, WorkoutLog, ExerciseLog } from "@/lib/supabase/services/WorkoutService";
import { AssessmentService } from "@/lib/supabase/services/AssessmentService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Import new modular dashboard components
import { DailyWorkoutSummaryCard } from "@/components/dashboard/DailyWorkoutSummaryCard";
import { NutritionProgressCard } from "@/components/dashboard/NutritionProgressCard";
import { TDEEBalanceCard } from "@/components/dashboard/TDEEBalanceCard";
import { HabitStreakCard } from "@/components/dashboard/HabitStreakCard";
import { AICoachInsightCard } from "@/components/dashboard/AICoachInsightCard";

export function Dashboard() {
  const [selectedDay, setSelectedDay] = useState(format(new Date(), 'EEEE'));
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [cardStates, setCardStates] = useState({
    workoutSummary: false,
    nutrition: false,
    tdeeBalance: false,
    habitStreak: false,
    aiInsights: false
  });
  
  const { isAuthenticated, userId } = useAuth();
  const { user } = useUser();
  const queryClient = useQueryClient();
  
  const today = new Date();
  const dateString = format(today, 'yyyy-MM-dd');
  
  // Get the current week dates
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(startOfCurrentWeek, i));
  
  // Get the selected date
  const selectedDateIndex = weekDates.findIndex(date => 
    format(date, 'EEEE').toLowerCase() === selectedDay.toLowerCase()
  );
  const selectedDate = selectedDateIndex !== -1 ? weekDates[selectedDateIndex] : today;
  const selectedDateString = format(selectedDate, 'yyyy-MM-dd');

  // Query for weekly workout schedules - this will run when component mounts and when userId changes
  const { data: weeklyWorkouts, isLoading: isLoadingWeekly } = useQuery({
    queryKey: ['weeklyWorkouts', userId],
    queryFn: async () => {
      if (!userId) return {};
      console.log("Fetching weekly workouts for user:", userId);
      return await AssessmentService.getWeeklyWorkouts(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  // Query for workout schedules
  const { data: workoutSchedules, isLoading: isLoadingSchedules } = useQuery({
    queryKey: ['workoutSchedules', userId, format(startOfCurrentWeek, 'yyyy-MM-dd'), format(addDays(startOfCurrentWeek, 6), 'yyyy-MM-dd')],
    queryFn: async () => {
      if (!userId) return [];
      console.log("Fetching workout schedules");
      return await WorkoutService.getWorkoutSchedule(
        userId,
        format(startOfCurrentWeek, 'yyyy-MM-dd'),
        format(addDays(startOfCurrentWeek, 6), 'yyyy-MM-dd')
      );
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  // Query for the selected day workout details
  const { data: selectedWorkout, isLoading: isLoadingSelectedWorkout } = useQuery({
    queryKey: ['selectedWorkout', selectedDateString, userId],
    queryFn: async () => {
      if (!userId || !workoutSchedules) return null;
      
      console.log(`Finding workout for ${selectedDateString}`);
      const scheduledWorkout = workoutSchedules.find(schedule => 
        schedule.scheduled_date === selectedDateString
      );
      
      if (!scheduledWorkout || !scheduledWorkout.workout_plan_id) {
        console.log("No scheduled workout found for selected date");
        return null;
      }
      
      console.log(`Found scheduled workout: ${scheduledWorkout.id}`);
      const workoutPlan = await WorkoutService.getWorkoutPlanById(scheduledWorkout.workout_plan_id);
      if (!workoutPlan) {
        console.log("Could not find workout plan");
        return null;
      }
      
      console.log(`Found workout plan: ${workoutPlan.title}`);
      const exercises = await WorkoutService.getWorkoutExercises(workoutPlan.id!);
      
      let completedExercises: Record<string, boolean> = {};
      let allExerciseLogs: any[] = [];
      
      if (scheduledWorkout.is_completed && scheduledWorkout.workout_log_id) {
        const exerciseLogs = await WorkoutService.getExerciseLogs(scheduledWorkout.workout_log_id);
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
        source: 'planned' as const
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
          source: 'voice' as const
        }));
      
      return {
        schedule_id: scheduledWorkout.id,
        id: workoutPlan.id,
        title: workoutPlan.title,
        exercises: [...plannedExercises, ...voiceLoggedExercises],
        is_completed: scheduledWorkout.is_completed || false,
        workout_log_id: scheduledWorkout.workout_log_id
      };
    },
    enabled: !!userId && !!workoutSchedules,
    staleTime: 1000 * 60 * 5,
  });

  // Mutation to schedule a workout
  const scheduleWorkoutMutation = useMutation({
    mutationFn: async ({ workout_plan_id, scheduled_date }: { workout_plan_id: string, scheduled_date: string }) => {
      if (!userId) throw new Error("User not authenticated");
      
      console.log(`Scheduling workout ${workout_plan_id} for ${scheduled_date}`);
      
      const schedule: WorkoutSchedule = {
        user_id: userId,
        workout_plan_id,
        scheduled_date,
        is_completed: false
      };
      
      return await WorkoutService.scheduleWorkout(schedule);
    },
    onSuccess: () => {
      console.log("Successfully scheduled workout");
      queryClient.invalidateQueries({ queryKey: ['workoutSchedules'] });
      queryClient.invalidateQueries({ queryKey: ['weeklyWorkouts'] });
      queryClient.invalidateQueries({ queryKey: ['selectedWorkout'] });
      
      toast({
        title: "Workout Scheduled",
        description: `Your workout has been scheduled for ${selectedDay}.`
      });
    },
    onError: (error) => {
      console.error("Error scheduling workout:", error);
      toast({
        title: "Error",
        description: "Failed to schedule workout. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Mutation to complete or uncomplete exercise
  const completeExerciseMutation = useMutation({
    mutationFn: async ({
      scheduleId,
      exerciseId,
      exerciseName,
      completed,
      allExercises
    }: {
      scheduleId: string,
      exerciseId: string,
      exerciseName: string,
      completed: boolean,
      allExercises: any[]
    }) => {
      if (!userId) throw new Error("User not authenticated");
      
      const schedule = workoutSchedules?.find(s => s.id === scheduleId);
      if (!schedule) throw new Error("Workout schedule not found");
      
      console.log(`Updating exercise completion for ${exerciseName} to ${completed}`);
      
      const updatedCompletedExercises = allExercises
        .filter(ex => ex.id === exerciseId ? completed : !!ex.completed)
        .map((ex, index) => ({
          exercise_name: ex.name,
          sets_completed: ex.sets,
          reps_completed: ex.reps,
          weight_used: ex.weight,
          order_index: index
        } as Omit<ExerciseLog, 'workout_log_id'>));
      
      if (schedule.workout_log_id) {
        if (updatedCompletedExercises.length === 0) {
          await WorkoutService.deleteWorkoutLog(schedule.workout_log_id);
          await WorkoutService.updateScheduledWorkout(scheduleId, {
            is_completed: false,
            workout_log_id: null,
            completion_date: null
          });
          return scheduleId;
        } else {
          await WorkoutService.deleteExerciseLogs(schedule.workout_log_id);
          await WorkoutService.addExerciseLogs(
            schedule.workout_log_id, 
            updatedCompletedExercises
          );
          
          const isStillCompleted = updatedCompletedExercises.length > 0;
          if (isStillCompleted !== schedule.is_completed) {
            await WorkoutService.updateScheduledWorkout(scheduleId, {
              is_completed: isStillCompleted
            });
          }
          
          return scheduleId;
        }
      } else if (updatedCompletedExercises.length > 0) {
        const log: WorkoutLog = {
          user_id: userId,
          workout_plan_id: schedule.workout_plan_id,
          start_time: new Date().toISOString(),
          end_time: new Date().toISOString(),
        };
        
        const logId = await WorkoutService.logWorkout(log, updatedCompletedExercises);
        
        if (logId) {
          console.log(`Created workout log ${logId} and updating schedule ${scheduleId}`);
          await WorkoutService.completeScheduledWorkout(scheduleId, logId);
          return scheduleId;
        }
      }
      
      return scheduleId;
    },
    onSuccess: () => {
      console.log("Successfully updated exercise completion");
      queryClient.invalidateQueries({ queryKey: ['selectedWorkout'] });
      queryClient.invalidateQueries({ queryKey: ['workoutSchedules'] });
      queryClient.invalidateQueries({ queryKey: ['weeklyWorkouts'] });
      
      toast({
        title: "Progress Updated",
        description: "Your workout progress has been saved."
      });
    },
    onError: (error) => {
      console.error("Error updating exercise completion:", error);
      toast({
        title: "Error",
        description: "Failed to update exercise completion. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Function to refresh workout data after voice logging
  const handleWorkoutUpdated = () => {
    queryClient.invalidateQueries({ queryKey: ['selectedWorkout'] });
    queryClient.invalidateQueries({ queryKey: ['workoutSchedules'] });
    queryClient.invalidateQueries({ queryKey: ['weeklyWorkouts'] });
  };

  const handleDaySelect = (day: string) => {
    console.log(`Selected day: ${day}`);
    setSelectedDay(day);
  };

  const handleWorkoutSelected = (workout: any) => {
    if (!workout || !workout.id) {
      toast({
        title: "Error",
        description: "Please select a valid workout.",
        variant: "destructive"
      });
      return;
    }
    
    console.log(`Selected workout: ${workout.id}`);
    scheduleWorkoutMutation.mutate({
      workout_plan_id: workout.id,
      scheduled_date: selectedDateString
    });
    
    setShowAddWorkout(false);
  };

  const handleStartWorkout = (workout: any) => {
    console.log("Starting workout:", workout);
    // Navigate to workout session or handle start logic
    toast({
      title: "Starting Workout",
      description: `Starting ${workout.title}...`
    });
  };

  const handleEditWorkout = (workout: any) => {
    console.log("Editing workout:", workout);
    // Handle edit logic if needed
  };

  const handleAskCoach = () => {
    console.log("Opening AI coach");
    // Handle AI coach interaction
    toast({
      title: "AI Coach",
      description: "AI coach feature will be available soon!"
    });
  };

  const handleReplaceWorkout = () => {
    console.log("Replacing workout");
    setShowAddWorkout(true);
  };

  const handleUpdateWorkout = async (updatedWorkout: any, saveType: 'today' | 'all_future' = 'today') => {
    if (!selectedWorkout || !selectedWorkout.schedule_id) return;
    
    try {
      console.log(`Updating workout with save type: ${saveType}`, updatedWorkout);
      
      // Prepare exercise data with proper superset handling
      const exerciseData = updatedWorkout.exercises.map((ex: any, index: number) => ({
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight || 'bodyweight',
        rest_time: ex.rest_seconds || 60,
        order_index: index,
        notes: ex.superset_group_id ? `Superset: ${ex.superset_group_id}` : undefined
      }));

      if (saveType === 'all_future') {
        console.log("Saving to all workouts of this type");
        // Update the original workout plan (affects all future workouts)
        const success = await WorkoutService.updateAllFutureWorkoutsOfType(
          userId!,
          updatedWorkout.id,
          exerciseData
        );
        
        if (!success) {
          throw new Error("Failed to update all future workouts");
        }
      } else {
        console.log("Saving for today only");
        // Create a one-off workout plan for this specific date
        const oneOffPlanId = await WorkoutService.createOneOffWorkoutSchedule(
          userId!,
          updatedWorkout.id,
          selectedDateString,
          exerciseData
        );
        
        if (!oneOffPlanId) {
          throw new Error("Failed to create one-off workout");
        }
      }
      
      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ['selectedWorkout'] });
      queryClient.invalidateQueries({ queryKey: ['workoutSchedules'] });
      queryClient.invalidateQueries({ queryKey: ['weeklyWorkouts'] });
      
      toast({
        title: "Workout Updated",
        description: saveType === 'all_future' 
          ? "Your changes have been applied to all future workouts of this type."
          : "Your changes have been saved for today only."
      });
    } catch (error) {
      console.error("Error updating workout:", error);
      toast({
        title: "Error",
        description: "Failed to update workout. Please try again.",
        variant: "destructive"
      });
    }
  };

  const toggleCardCollapse = (cardKey: keyof typeof cardStates) => {
    setCardStates(prev => ({
      ...prev,
      [cardKey]: !prev[cardKey]
    }));
  };

  return (
    <div className="max-w-lg mx-auto pb-20">
      {/* Snap a Snack and Log your workout buttons - minimal spacing from logo */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="h-16">
          <MealCaptureCard />
        </div>
        <div className="h-16">
          <VoiceInput 
            selectedWorkout={selectedWorkout}
            onWorkoutUpdated={handleWorkoutUpdated}
          />
        </div>
      </div>
      
      <div className="space-y-4 mb-6">
        <DailyWorkoutSummaryCard 
          isCollapsed={cardStates.workoutSummary}
          onToggleCollapse={() => toggleCardCollapse('workoutSummary')}
        />
        
        <NutritionProgressCard 
          isCollapsed={cardStates.nutrition}
          onToggleCollapse={() => toggleCardCollapse('nutrition')}
        />
        
        <TDEEBalanceCard 
          isCollapsed={cardStates.tdeeBalance}
          onToggleCollapse={() => toggleCardCollapse('tdeeBalance')}
        />
        
        <HabitStreakCard 
          isCollapsed={cardStates.habitStreak}
          onToggleCollapse={() => toggleCardCollapse('habitStreak')}
        />
        
        <AICoachInsightCard 
          isCollapsed={cardStates.aiInsights}
          onToggleCollapse={() => toggleCardCollapse('aiInsights')}
        />
      </div>
      
      <div className="flex flex-nowrap overflow-x-auto mb-6 pb-1 scrollbar-none">
        {weekDates.map((date, index) => {
          const dayName = format(date, 'EEEE');
          const dayNumber = format(date, 'd');
          const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
          const isActive = dayName === selectedDay;
          const hasScheduledWorkout = workoutSchedules?.some(
            schedule => schedule.scheduled_date === format(date, 'yyyy-MM-dd')
          );
          
          return (
            <DayTab
              key={dayName}
              day={dayName}
              date={dayNumber}
              isActive={isActive}
              isToday={isToday}
              hasActivity={hasScheduledWorkout}
              onClick={() => handleDaySelect(dayName)}
            />
          );
        })}
      </div>
      
      <AnimatedCard className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold">Today's Workout</h3>
            <p className="text-sm text-muted-foreground">{selectedDay}</p>
          </div>
          {!selectedWorkout && !isLoadingSelectedWorkout && (
            <Button 
              size="sm" 
              className="bg-hashim-600 hover:bg-hashim-700 text-white"
              onClick={() => setShowAddWorkout(true)}
            >
              <Plus size={16} className="mr-1" />
              Add Workout
            </Button>
          )}
        </div>
        
        {isLoadingSelectedWorkout || isLoadingSchedules ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hashim-600"></div>
          </div>
        ) : selectedWorkout ? (
          <WorkoutCard 
            workout={selectedWorkout} 
            onStart={handleStartWorkout}
            onEdit={handleEditWorkout}
            onAskCoach={handleAskCoach}
            onReplaceWorkout={handleReplaceWorkout}
            onUpdateWorkout={handleUpdateWorkout}
          />
        ) : (
          <div className="text-center p-6">
            <p className="text-muted-foreground mb-2">No workout scheduled for {selectedDay}</p>
            <Button 
              variant="outline"
              onClick={() => setShowAddWorkout(true)}
              className="flex items-center mx-auto"
            >
              <Plus size={16} className="mr-1" />
              Add a workout
            </Button>
          </div>
        )}
      </AnimatedCard>
      
      <AddWorkoutModal 
        isOpen={showAddWorkout} 
        onClose={() => setShowAddWorkout(false)}
        onAddWorkout={handleWorkoutSelected}
        selectedDay={selectedDay}
      />
    </div>
  );
}
