
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
import { Plus, User, Settings, Camera, Mic, Dumbbell, CheckCircle2, Play, Zap } from "lucide-react";
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
  const [showMealCapture, setShowMealCapture] = useState(false);
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

      {/* Enhanced Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* Snap a Snack Button */}
        <div className="relative">
          <Button 
            className="w-full h-20 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 hover:from-orange-500 hover:via-orange-600 hover:to-orange-700 text-white shadow-xl rounded-3xl border-0 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl group overflow-hidden"
            onClick={() => setShowMealCapture(true)}
          >
            {/* Animated background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            <div className="relative z-10 flex flex-col items-center space-y-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Camera size={18} className="text-white" />
              </div>
              <div className="text-center">
                <div className="font-bold text-base">Snap a Snack</div>
                <div className="text-xs opacity-90">Quick meal logging</div>
              </div>
            </div>
          </Button>
          
          {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-orange-400/20 rounded-3xl blur-xl -z-10 group-hover:bg-orange-400/30 transition-colors duration-300"></div>
        </div>

        {/* Log Exercise Button */}
        <div className="relative">
          <VoiceInput 
            selectedWorkout={selectedWorkout}
            onWorkoutUpdated={handleWorkoutUpdated}
            className="w-full h-20"
            buttonClassName="w-full h-full bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 hover:from-blue-500 hover:via-blue-600 hover:to-blue-700 text-white shadow-xl rounded-3xl border-0 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl group overflow-hidden"
            buttonContent={
              <div className="relative z-10">
                {/* Animated background effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                <div className="relative flex flex-col items-center space-y-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Mic size={18} className="text-white" />
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-base">Log Exercise</div>
                    <div className="text-xs opacity-90">Voice workout logging</div>
                  </div>
                </div>
              </div>
            }
          />
          
          {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-blue-400/20 rounded-3xl blur-xl -z-10 group-hover:bg-blue-400/30 transition-colors duration-300"></div>
        </div>
      </div>
      
      {/* Day Tabs */}
      <div className="flex flex-nowrap overflow-x-auto mb-8 pb-1 scrollbar-none">
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
      <div className="mb-8">
        {isLoadingSelectedWorkout || isLoadingSchedules ? (
          <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-3xl p-8 shadow-xl border border-gray-100/50 dark:border-gray-700/50">
            <div className="flex justify-center py-12">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
                <div className="absolute inset-0 rounded-full h-12 w-12 border-4 border-transparent border-t-blue-400 animate-spin" style={{ animationDelay: '0.3s', animationDuration: '1.2s' }}></div>
              </div>
            </div>
          </div>
        ) : selectedWorkout ? (
          <div className="relative overflow-hidden bg-gradient-to-br from-white via-purple-50/30 to-blue-50/30 dark:from-gray-900 dark:via-purple-900/10 dark:to-blue-900/10 rounded-3xl shadow-2xl border border-purple-100/50 dark:border-purple-800/30">
            {/* Subtle animated background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-tl from-green-400 to-orange-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
            
            <div className="relative z-10 p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-blue-800 dark:from-white dark:via-purple-200 dark:to-blue-200 bg-clip-text text-transparent">
                      Today's Workout
                    </h2>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{selectedDay}</p>
                </div>
                {selectedWorkout.is_completed ? (
                  <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full border border-green-200 dark:border-green-800">
                    <CheckCircle2 size={18} className="text-green-600 dark:text-green-400" />
                    <span className="text-sm font-bold text-green-700 dark:text-green-300">Complete</span>
                  </div>
                ) : (
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 hover:from-green-600 hover:via-green-700 hover:to-emerald-700 text-white rounded-full px-6 py-2 shadow-lg font-bold border-0 transition-all duration-300 hover:scale-105"
                  >
                    <Play size={16} className="mr-2" />
                    Start Workout
                  </Button>
                )}
              </div>

              {/* Workout Title */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 leading-tight">
                  {selectedWorkout.title}
                </h3>
                
                {/* Enhanced Progress Section */}
                <div className="relative">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        {workoutProgress.completed}/{workoutProgress.total}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">exercises</span>
                    </div>
                  </div>
                  
                  {/* Multi-colored progress bar */}
                  <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 rounded-full transition-all duration-700 ease-out relative overflow-hidden"
                      style={{ width: `${workoutProgress.percentage}%` }}
                    >
                      {/* Animated shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 animate-pulse"></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">0%</span>
                    <div className="text-center">
                      <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-green-600 bg-clip-text text-transparent">
                        {workoutProgress.percentage}% complete
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">100%</span>
                  </div>
                </div>
              </div>

              {/* Exercise List with enhanced styling */}
              <div className="space-y-4">
                {selectedWorkout.exercises.slice(0, 3).map((exercise, index) => (
                  <div 
                    key={exercise.id} 
                    className={`relative group flex items-center p-4 rounded-2xl transition-all duration-300 ${
                      exercise.completed 
                        ? 'bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-green-900/20 border border-green-200 dark:border-green-800' 
                        : 'bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-gray-800/50 dark:via-gray-800/30 dark:to-gray-800/50 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
                    }`}
                  >
                    <button
                      onClick={() => handleExerciseComplete(exercise.id, !exercise.completed)}
                      className={`w-7 h-7 rounded-full border-2 mr-4 flex items-center justify-center transition-all duration-300 ${
                        exercise.completed
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-500 shadow-lg'
                          : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                      }`}
                    >
                      {exercise.completed && (
                        <CheckCircle2 size={16} className="text-white" />
                      )}
                    </button>
                    
                    <div className="flex-1">
                      <h4 className={`font-semibold text-base ${exercise.completed ? 'text-green-700 dark:text-green-300 line-through' : 'text-gray-900 dark:text-white'}`}>
                        {exercise.name}
                      </h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <p className={`text-sm ${exercise.completed ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                          {exercise.sets} sets • {exercise.reps} reps • {exercise.weight}
                        </p>
                        {exercise.source === 'voice' && (
                          <span className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full font-medium border border-blue-200 dark:border-blue-800">
                            <Mic size={10} className="mr-1" />
                            Voice logged
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {selectedWorkout.exercises.length > 3 && (
                  <div className="text-center pt-2">
                    <Button variant="ghost" size="sm" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-medium">
                      <Plus size={16} className="mr-1" />
                      {selectedWorkout.exercises.length - 3} more exercises
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-orange-100/50 to-yellow-50 dark:from-orange-900/20 dark:via-orange-800/20 dark:to-yellow-900/20 rounded-3xl shadow-xl border border-orange-200/50 dark:border-orange-800/50">
            {/* Animated background elements */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute bottom-4 left-4 w-24 h-24 bg-gradient-to-tr from-orange-300 to-red-300 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
            
            <div className="relative z-10 p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-400 via-orange-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <Dumbbell size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">No workout scheduled</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-sm mx-auto leading-relaxed">Ready to get stronger? Let's add a workout for {selectedDay}</p>
              <Button 
                onClick={() => setShowAddWorkout(true)}
                className="bg-gradient-to-r from-orange-500 via-orange-600 to-yellow-600 hover:from-orange-600 hover:via-orange-700 hover:to-yellow-700 text-white rounded-full px-8 py-3 shadow-xl font-bold border-0 transition-all duration-300 hover:scale-105"
              >
                <Plus size={18} className="mr-2" />
                Add a workout
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Dashboard Cards */}
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
      
      {/* Modals */}
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

      {/* Meal Capture Modal */}
      {showMealCapture && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="flex justify-end mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMealCapture(false)}
                className="text-white hover:bg-white/20 rounded-full"
              >
                ✕
              </Button>
            </div>
            <MealCaptureCard />
          </div>
        </div>
      )}
    </div>
  );
}
