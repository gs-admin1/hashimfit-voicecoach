import { useState, useEffect } from "react";
import { format, startOfWeek, addDays } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { useUser } from "@/context/UserContext";
import { UserStatsModal } from "@/components/UserStatsModal";
import { MealCaptureCard } from "@/components/MealCaptureCard";
import { WorkoutCard } from "@/components/WorkoutCard";
import { AddWorkoutModal } from "@/components/AddWorkoutModal";
import { VoiceInput } from "@/components/VoiceInput";
import { Button } from "@/components/ui/button";
import { DayTab } from "@/components/DayTab";
import { AnimatedCard, IconButton } from "@/components/ui-components";
import { Plus, User, Settings, Camera, Mic, Dumbbell, CheckCircle2, Play } from "lucide-react";
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
  const [showStatsModal, setShowStatsModal] = useState(false);
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
        source: 'planned'
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
          source: 'voice'
        }));
      
      return {
        schedule_id: scheduledWorkout.id,
        id: workoutPlan.id,
        title: workoutPlan.title,
        exercises: [...plannedExercises, ...voiceLoggedExercises],
        is_completed: scheduledWorkout.is_completed || false
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

  const handleExerciseComplete = (exerciseId: string, completed: boolean) => {
    if (!selectedWorkout || !selectedWorkout.schedule_id) return;
    
    console.log(`Toggling exercise ${exerciseId} completion to: ${completed}`);
    completeExerciseMutation.mutate({
      scheduleId: selectedWorkout.schedule_id,
      exerciseId,
      exerciseName: selectedWorkout.exercises.find(ex => ex.id === exerciseId)?.name || "",
      completed,
      allExercises: selectedWorkout.exercises
    });
  };

  const toggleCardCollapse = (cardKey: keyof typeof cardStates) => {
    setCardStates(prev => ({
      ...prev,
      [cardKey]: !prev[cardKey]
    }));
  };

  // Calculate workout progress
  const workoutProgress = selectedWorkout 
    ? {
        completed: selectedWorkout.exercises.filter(ex => ex.completed).length,
        total: selectedWorkout.exercises.length,
        percentage: Math.round((selectedWorkout.exercises.filter(ex => ex.completed).length / selectedWorkout.exercises.length) * 100)
      }
    : { completed: 0, total: 0, percentage: 0 };

  return (
    <div className="max-w-lg mx-auto pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}</h1>
        <div className="flex items-center space-x-2">
          <IconButton 
            icon={Settings}
            variant="outline"
            onClick={() => {}}
          />
          <IconButton 
            icon={User}
            variant="outline"
            onClick={() => setShowStatsModal(true)}
          />
        </div>
      </div>

      {/* Quick Actions - Moved to top */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Button 
          className="h-16 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg rounded-2xl flex items-center justify-center space-x-2 transition-all duration-200 hover:scale-105"
          onClick={() => {}}
        >
          <Camera size={20} />
          <span className="font-semibold">Snap a Snack</span>
        </Button>
        
        <div className="h-16 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-105">
          <VoiceInput 
            selectedWorkout={selectedWorkout}
            onWorkoutUpdated={handleWorkoutUpdated}
            className="w-full h-full bg-transparent border-0 shadow-none p-0"
            buttonClassName="w-full h-full bg-transparent hover:bg-transparent text-white flex items-center justify-center space-x-2"
            buttonContent={
              <>
                <Mic size={20} />
                <span className="font-semibold">Log Exercise</span>
              </>
            }
          />
        </div>
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
      
      {/* Enhanced Today's Workout Section */}
      <div className="mb-6">
        {isLoadingSelectedWorkout || isLoadingSchedules ? (
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-6 shadow-lg">
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hashim-600"></div>
            </div>
          </div>
        ) : selectedWorkout ? (
          <div className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Today's Workout</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedDay}</p>
              </div>
              {selectedWorkout.is_completed ? (
                <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <CheckCircle2 size={16} className="text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">Complete</span>
                </div>
              ) : (
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full px-4 shadow-lg"
                >
                  <Play size={14} className="mr-1" />
                  Start
                </Button>
              )}
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">{selectedWorkout.title}</h3>
              
              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Progress</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {workoutProgress.completed}/{workoutProgress.total} exercises
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${workoutProgress.percentage}%` }}
                  />
                </div>
                <div className="text-right text-xs text-purple-600 dark:text-purple-400 font-medium mt-1">
                  {workoutProgress.percentage}% complete
                </div>
              </div>
            </div>

            {/* Exercise List */}
            <div className="space-y-3">
              {selectedWorkout.exercises.slice(0, 3).map((exercise, index) => (
                <div 
                  key={exercise.id} 
                  className={`flex items-center p-3 rounded-xl transition-all duration-200 ${
                    exercise.completed 
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                      : 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <button
                    onClick={() => handleExerciseComplete(exercise.id, !exercise.completed)}
                    className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center transition-all duration-200 ${
                      exercise.completed
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300 dark:border-gray-600 hover:border-green-400'
                    }`}
                  >
                    {exercise.completed && (
                      <CheckCircle2 size={14} className="text-white" />
                    )}
                  </button>
                  
                  <div className="flex-1">
                    <h4 className={`font-medium ${exercise.completed ? 'text-green-700 dark:text-green-300 line-through' : 'text-gray-800 dark:text-gray-200'}`}>
                      {exercise.name}
                    </h4>
                    <p className={`text-sm ${exercise.completed ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                      {exercise.sets} sets • {exercise.reps} reps • {exercise.weight}
                      {exercise.source === 'voice' && (
                        <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full">
                          Voice logged
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
              
              {selectedWorkout.exercises.length > 3 && (
                <div className="text-center">
                  <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400">
                    +{selectedWorkout.exercises.length - 3} more exercises
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-3xl p-8 text-center shadow-lg border border-orange-200 dark:border-orange-800">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Dumbbell size={28} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">No workout scheduled</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Ready to get stronger? Let's add a workout for {selectedDay}</p>
            <Button 
              onClick={() => setShowAddWorkout(true)}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full px-6 shadow-lg"
            >
              <Plus size={16} className="mr-1" />
              Add a workout
            </Button>
          </div>
        )}
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
      
      <AddWorkoutModal 
        isOpen={showAddWorkout} 
        onClose={() => setShowAddWorkout(false)}
        onAddWorkout={handleWorkoutSelected}
        selectedDay={selectedDay}
      />
      
      <UserStatsModal 
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
      />
    </div>
  );
}
