
import { useState, useEffect } from "react";
import { format, startOfWeek, addDays } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { useUser } from "@/context/UserContext";
import { UserStatsModal } from "@/components/UserStatsModal";
import { MealCaptureCard } from "@/components/MealCaptureCard";
import { WorkoutCard } from "@/components/WorkoutCard";
import { AddWorkoutModal } from "@/components/AddWorkoutModal";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { DayTab } from "@/components/DayTab";
import { AnimatedCard, StatsCard, VoiceWidget, IconButton } from "@/components/ui-components";
import { Plus, Activity, Dumbbell, Weight, Calendar, ChartBar, Utensils, User, Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { WorkoutService, WorkoutSchedule, WorkoutLog, ExerciseLog } from "@/lib/supabase/services/WorkoutService";
import { AssessmentService } from "@/lib/supabase/services/AssessmentService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function Dashboard() {
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(format(new Date(), 'EEEE'));
  const [showAddWorkout, setShowAddWorkout] = useState(false);
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
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
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
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
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
      
      // Get completion status if the workout is completed
      let completedExercises: Record<string, boolean> = {};
      if (scheduledWorkout.is_completed && scheduledWorkout.workout_log_id) {
        const exerciseLogs = await WorkoutService.getExerciseLogs(scheduledWorkout.workout_log_id);
        completedExercises = exerciseLogs.reduce((acc, log) => {
          acc[log.exercise_name] = true;
          return acc;
        }, {} as Record<string, boolean>);
      }
      
      return {
        schedule_id: scheduledWorkout.id,
        id: workoutPlan.id,
        title: workoutPlan.title,
        exercises: exercises.map(ex => ({
          id: ex.id!,
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight || 'bodyweight',
          completed: completedExercises[ex.name] || false
        })),
        is_completed: scheduledWorkout.is_completed || false
      };
    },
    enabled: !!userId && !!workoutSchedules,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
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

  // Mutation to complete exercise
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
      
      // Get the workout schedule
      const schedule = workoutSchedules?.find(s => s.id === scheduleId);
      if (!schedule) throw new Error("Workout schedule not found");
      
      console.log(`Updating exercise completion for ${exerciseName} to ${completed}`);
      
      // If we already have a workout log and the exercise is already marked as completed, 
      // we might need to update it instead of creating a new one
      if (schedule.workout_log_id && !completed) {
        // For simplicity, we'll just create a new log for now
        // In a real app, you would update the existing log
        console.log("Would update existing log here to mark exercise as incomplete");
        return scheduleId;
      }
      
      if (!schedule.workout_log_id) {
        // Create a workout log since this is the first completed exercise
        const log: WorkoutLog = {
          user_id: userId,
          workout_plan_id: schedule.workout_plan_id,
          start_time: new Date().toISOString(),
          end_time: new Date().toISOString(),
        };
        
        // Only log completed exercises
        const completedExercises = allExercises
          .filter(ex => ex.id === exerciseId ? completed : !!ex.completed)
          .map((ex, index) => ({
            exercise_name: ex.name,
            sets_completed: ex.sets,
            reps_completed: ex.reps,
            weight_used: ex.weight,
            order_index: index
          } as Omit<ExerciseLog, 'workout_log_id'>));
        
        if (completedExercises.length > 0) {
          // Log the workout and exercises
          const logId = await WorkoutService.logWorkout(log, completedExercises);
          
          // Update the schedule with the workout log id
          if (logId) {
            console.log(`Created workout log ${logId} and updating schedule ${scheduleId}`);
            await WorkoutService.completeScheduledWorkout(scheduleId, logId);
            return scheduleId;
          }
        }
      } else {
        // Update existing workout log
        // This is simplified - in a real app you'd update the specific exercise in the log
        console.log("Would update existing log here");
        return scheduleId;
      }
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
    
    console.log(`Completing exercise ${exerciseId}: ${completed}`);
    completeExerciseMutation.mutate({
      scheduleId: selectedWorkout.schedule_id,
      exerciseId,
      exerciseName: selectedWorkout.exercises.find(ex => ex.id === exerciseId)?.name || "",
      completed,
      allExercises: selectedWorkout.exercises
    });
  };

  return (
    <div className="max-w-lg mx-auto pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}</h1>
        <IconButton 
          icon={User}
          variant="outline"
          onClick={() => setShowStatsModal(true)}
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
            onExerciseComplete={handleExerciseComplete}
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
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatsCard
          title="Weight"
          value={user ? `${user.weight}kg` : "75kg"}
          icon={Weight}
          trend="down"
          trendValue="-2kg"
        />
        <StatsCard
          title="Active Days"
          value="5/7"
          icon={Activity}
          trend="up"
          trendValue="+1"
        />
      </div>
      
      <AnimatedCard className="mb-6" delay={100}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Streaks</h3>
          <div className="text-sm text-muted-foreground">5 days</div>
        </div>
        <div className="flex space-x-1">
          {Array.from({ length: 7 }, (_, i) => (
            <div 
              key={i}
              className={`h-2 flex-1 rounded-full ${i < 5 ? 'bg-hashim-600' : 'bg-gray-200 dark:bg-gray-700'}`}
            ></div>
          ))}
        </div>
      </AnimatedCard>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <AnimatedCard delay={150} className="overflow-hidden">
          <div className="flex flex-col h-full">
            <h3 className="font-semibold mb-2 flex items-center">
              <Utensils className="mr-2 text-hashim-600" size={16} /> 
              Nutrition
            </h3>
            <div className="space-y-2 flex-1">
              <div>
                <div className="flex justify-between text-sm">
                  <span>Protein</span>
                  <span>80g / 140g</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '57%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>Carbs</span>
                  <span>120g / 200g</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>Fat</span>
                  <span>45g / 70g</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: '64%' }}></div>
                </div>
              </div>
            </div>
            <div className="mt-3 text-center">
              <Button variant="ghost" size="sm" className="text-xs h-7">
                View Details
              </Button>
            </div>
          </div>
        </AnimatedCard>
        
        <AnimatedCard delay={200} className="overflow-hidden">
          <div className="flex flex-col h-full">
            <h3 className="font-semibold mb-2 flex items-center">
              <ChartBar className="mr-2 text-hashim-600" size={16} /> 
              Progress
            </h3>
            <div className="space-y-2 flex-1">
              <div>
                <div className="flex justify-between text-sm">
                  <span>Weight</span>
                  <span className="text-green-500">-2kg</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div className="bg-hashim-600 h-2 rounded-full" style={{ width: '40%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>Strength</span>
                  <span className="text-green-500">+15%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div className="bg-hashim-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>Endurance</span>
                  <span className="text-green-500">+8%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div className="bg-hashim-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
            </div>
            <div className="mt-3 text-center">
              <Button variant="ghost" size="sm" className="text-xs h-7">
                View Details
              </Button>
            </div>
          </div>
        </AnimatedCard>
      </div>
      
      <AnimatedCard className="mb-6" delay={250}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Zap className="mr-2 text-hashim-600" size={18} />
            Quick Actions
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="outline"
            className="flex flex-col items-center justify-center h-24"
          >
            <Dumbbell className="mb-2 text-hashim-600" size={24} />
            <span>Log a Workout</span>
          </Button>
          <Button 
            variant="outline"
            className="flex flex-col items-center justify-center h-24"
          >
            <Utensils className="mb-2 text-hashim-600" size={24} />
            <span>Log Nutrition</span>
          </Button>
          <Button 
            variant="outline"
            className="flex flex-col items-center justify-center h-24"
          >
            <Weight className="mb-2 text-hashim-600" size={24} />
            <span>Log Weight</span>
          </Button>
          <Button 
            variant="outline"
            className="flex flex-col items-center justify-center h-24"
          >
            <Calendar className="mb-2 text-hashim-600" size={24} />
            <span>Plan Week</span>
          </Button>
        </div>
      </AnimatedCard>
      
      <MealCaptureCard />
      
      <div className="my-6">
        <VoiceWidget />
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
