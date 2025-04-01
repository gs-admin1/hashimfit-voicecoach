
import { useState, useEffect } from "react";
import { AnimatedCard, SectionTitle, DayTab } from "./ui-components";
import { ProgressChart } from "./ProgressChart";
import { Plus, Dumbbell, Apple } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, startOfWeek, addDays } from "date-fns";
import { WorkoutCard } from "./WorkoutCard";
import { UserStatsModal } from "./UserStatsModal";
import { AddWorkoutModal } from "./AddWorkoutModal";
import { WorkoutService, WorkoutSchedule } from "@/lib/supabase/services/WorkoutService";
import { NutritionService } from "@/lib/supabase/services/NutritionService";
import { toast } from "@/hooks/use-toast";

interface DailyWorkout {
  id: string;
  title: string;
  schedule_id?: string;
  exercises: {
    id: string;
    name: string;
    sets: number;
    reps: string;
    weight: string;
    completed?: boolean;
  }[];
}

interface WeeklyWorkouts {
  [key: string]: DailyWorkout | null;
}

// Mock progress data - this will be replaced with real data
const progressData = [
  { date: "Mon", weight: 80.5, calories: 2100, protein: 150, carbs: 200, fat: 70 },
  { date: "Tue", weight: 80.3, calories: 2200, protein: 160, carbs: 210, fat: 65 },
  { date: "Wed", weight: 80.1, calories: 2050, protein: 155, carbs: 190, fat: 75 },
  { date: "Thu", weight: 79.8, calories: 2150, protein: 165, carbs: 200, fat: 70 },
  { date: "Fri", weight: 79.5, calories: 2300, protein: 170, carbs: 220, fat: 80 },
  { date: "Sat", weight: 79.2, calories: 2250, protein: 160, carbs: 210, fat: 75 },
  { date: "Sun", weight: 79.0, calories: 2100, protein: 155, carbs: 195, fat: 70 },
];

export function Dashboard() {
  const { isAuthenticated, userId } = useAuth();
  const [activeTab, setActiveTab] = useState("workouts");
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [weeklyWorkouts, setWeeklyWorkouts] = useState<WeeklyWorkouts>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('Today');
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [scheduleCache, setScheduleCache] = useState<WorkoutSchedule[]>([]);
  
  // Generate days of the week
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  
  const days = Array.from({ length: 7 }).map((_, i) => {
    const date = addDays(weekStart, i);
    const dayName = format(date, 'EEEE');
    const formattedDate = format(date, 'yyyy-MM-dd');
    const isToday = format(today, 'yyyy-MM-dd') === formattedDate;
    return {
      name: isToday ? "Today" : dayName,
      value: dayName,
      date: formattedDate,
    };
  });
  
  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchWorkoutsAndNutrition();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, userId]);
  
  // Function to fetch workouts and nutrition data
  const fetchWorkoutsAndNutrition = async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      
      // Get the start and end dates for the current week
      const startDate = format(weekStart, 'yyyy-MM-dd');
      const endDate = format(addDays(weekStart, 6), 'yyyy-MM-dd');
      
      // Fetch scheduled workouts for the week
      const scheduledWorkouts = await WorkoutService.getWorkoutSchedule(
        userId, 
        startDate, 
        endDate
      );
      
      // Cache the schedule data for later use
      setScheduleCache(scheduledWorkouts);
      
      // Process and organize workouts by day
      const workoutsByDay: WeeklyWorkouts = {};
      
      // Initialize each day with null (no workout)
      days.forEach(day => {
        workoutsByDay[day.name] = null;
      });
      
      // Map scheduled workouts to their respective days
      await Promise.all(scheduledWorkouts.map(async (schedule) => {
        const day = days.find(d => d.date === schedule.scheduled_date);
        if (day) {
          try {
            // Get workout plan details
            const workoutPlan = await WorkoutService.getWorkoutPlanById(schedule.workout_plan_id);
            
            if (workoutPlan) {
              // Get exercises for this workout
              const exercises = await WorkoutService.getWorkoutExercises(workoutPlan.id!);
              
              // Create the workout object with all needed data
              workoutsByDay[day.name] = {
                id: workoutPlan.id!,
                schedule_id: schedule.id,
                title: workoutPlan.title,
                exercises: exercises.map(ex => ({
                  id: ex.id!,
                  name: ex.name,
                  sets: ex.sets,
                  reps: ex.reps,
                  weight: ex.weight || 'bodyweight',
                  completed: schedule.is_completed || false
                }))
              };
            }
          } catch (error) {
            console.error(`Error fetching workout details for ${schedule.workout_plan_id}:`, error);
          }
        }
      }));
      
      setWeeklyWorkouts(workoutsByDay);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load your workout data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomWorkouts = async () => {
    if (!userId) return;
    
    try {
      // Get custom workouts already fetched from scheduled workouts
      // This would usually be a separate API call if needed
    } catch (error) {
      console.error('Error fetching custom workouts:', error);
    }
  };
  
  const handleExerciseComplete = async (day: string, exerciseId: string, completed: boolean) => {
    if (!userId || !weeklyWorkouts[day]?.schedule_id) return;
    
    try {
      // Update state optimistically
      setWeeklyWorkouts(prevWorkouts => {
        const updatedWorkouts = { ...prevWorkouts };
        
        if (updatedWorkouts[day]) {
          updatedWorkouts[day] = {
            ...updatedWorkouts[day]!,
            exercises: updatedWorkouts[day]!.exercises.map(ex => {
              if (ex.id === exerciseId) {
                return { ...ex, completed };
              }
              return ex;
            })
          };
        }
        
        return updatedWorkouts;
      });
      
      // Check if all exercises are completed
      const allCompleted = weeklyWorkouts[day]?.exercises.every(ex => 
        ex.id === exerciseId ? completed : ex.completed
      );
      
      if (allCompleted) {
        // If all exercises are completed, mark the scheduled workout as completed
        const scheduleId = weeklyWorkouts[day]?.schedule_id!;
        
        // Create workout log entry
        const workoutLog = {
          user_id: userId,
          workout_plan_id: weeklyWorkouts[day]?.id,
          start_time: new Date().toISOString(),
          end_time: new Date().toISOString(),
          duration: 60 * 60, // 1 hour in seconds (placeholder)
          rating: 4 // Placeholder rating
        };
        
        // Create exercise logs
        const exerciseLogs = weeklyWorkouts[day]?.exercises.map((ex, index) => ({
          exercise_name: ex.name,
          sets_completed: ex.sets,
          reps_completed: ex.reps,
          weight_used: ex.weight,
          order_index: index
        })) || [];
        
        // Log the completed workout
        const workoutLogId = await WorkoutService.logWorkout(workoutLog, exerciseLogs);
        
        if (workoutLogId) {
          // Mark the scheduled workout as completed
          await WorkoutService.completeScheduledWorkout(scheduleId, workoutLogId);
          
          toast({
            title: "Workout completed",
            description: "Great job! Your workout has been marked as completed."
          });
        }
      } else {
        // For individual exercise tracking, we could add a separate table in the future
        // For now, we're just updating the UI state
      }
    } catch (error) {
      console.error('Error updating exercise completion:', error);
      toast({
        title: "Error",
        description: "Failed to update exercise completion status.",
        variant: "destructive"
      });
    }
  };

  const handleAddExercise = async (day: string, exercise: { name: string; sets: number; reps: string; weight: string }) => {
    if (!userId || !weeklyWorkouts[day]) return;
    
    try {
      // Add exercise to the workout in Supabase
      const workoutPlanId = weeklyWorkouts[day]?.id;
      if (!workoutPlanId) return;
      
      // Create new exercise in the database
      const newExercise = {
        workout_plan_id: workoutPlanId,
        name: exercise.name,
        sets: exercise.sets,
        reps: exercise.reps,
        weight: exercise.weight,
        order_index: weeklyWorkouts[day]?.exercises.length || 0
      };
      
      const createdExercises = await WorkoutService.createWorkoutExercises([newExercise]);
      
      if (createdExercises && createdExercises.length > 0) {
        // Update state with the new exercise
        setWeeklyWorkouts(prevWorkouts => {
          const updatedWorkouts = { ...prevWorkouts };
          
          if (updatedWorkouts[day]) {
            updatedWorkouts[day] = {
              ...updatedWorkouts[day]!,
              exercises: [
                ...updatedWorkouts[day]!.exercises,
                {
                  id: createdExercises[0].id!,
                  name: exercise.name,
                  sets: exercise.sets,
                  reps: exercise.reps,
                  weight: exercise.weight,
                  completed: false
                }
              ]
            };
          }
          
          return updatedWorkouts;
        });
        
        toast({
          title: "Exercise added",
          description: "New exercise has been added to your workout."
        });
      }
    } catch (error) {
      console.error('Error adding exercise:', error);
      toast({
        title: "Error",
        description: "Failed to add exercise to workout.",
        variant: "destructive"
      });
    }
  };

  const handleRemoveExercise = async (day: string, exerciseId: string) => {
    if (!userId || !weeklyWorkouts[day]) return;
    
    try {
      // Delete exercise from the database
      const success = await WorkoutService.deleteWorkoutExercise(exerciseId);
      
      if (success) {
        // Update state to remove the exercise
        setWeeklyWorkouts(prevWorkouts => {
          const updatedWorkouts = { ...prevWorkouts };
          
          if (updatedWorkouts[day]) {
            updatedWorkouts[day] = {
              ...updatedWorkouts[day]!,
              exercises: updatedWorkouts[day]!.exercises.filter(ex => ex.id !== exerciseId)
            };
          }
          
          return updatedWorkouts;
        });
        
        toast({
          title: "Exercise removed",
          description: "Exercise has been removed from your workout."
        });
      }
    } catch (error) {
      console.error('Error removing exercise:', error);
      toast({
        title: "Error",
        description: "Failed to remove exercise from workout.",
        variant: "destructive"
      });
    }
  };

  // Handler for adding a full workout
  const handleAddWorkout = async (workout: any) => {
    try {
      if (!userId) return;
      
      // First, check if the selected day corresponds to a date
      const selectedDayObj = days.find(day => day.name === selectedDay);
      if (!selectedDayObj) {
        toast({
          title: "Error",
          description: "Could not determine the date for the selected day.",
          variant: "destructive"
        });
        return;
      }
      
      // Schedule the workout in Supabase
      const scheduleData: Omit<WorkoutSchedule, 'id' | 'created_at' | 'updated_at'> = {
        user_id: userId,
        workout_plan_id: workout.id,
        scheduled_date: selectedDayObj.date,
        scheduled_time: null,
        duration: null,
        is_completed: false,
        completion_date: null,
        workout_log_id: null,
        notes: null
      };
      
      // Add the workout to the schedule
      const scheduleId = await WorkoutService.scheduleWorkout(scheduleData);
      
      if (scheduleId) {
        // Get exercises for this workout
        const exercises = await WorkoutService.getWorkoutExercises(workout.id);
        
        // Update state with the new workout
        const newWorkout = {
          id: workout.id,
          schedule_id: scheduleId,
          title: workout.title,
          exercises: exercises.map(ex => ({
            id: ex.id!,
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight || 'bodyweight',
            completed: false
          }))
        };
        
        setWeeklyWorkouts(prevWorkouts => ({
          ...prevWorkouts,
          [selectedDay]: newWorkout
        }));
        
        toast({
          title: "Workout added",
          description: `${workout.title} has been added to ${selectedDay}.`
        });
      } else {
        throw new Error("Failed to schedule workout");
      }
    } catch (error) {
      console.error('Error adding workout:', error);
      toast({
        title: "Error",
        description: "Failed to add workout. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Welcome Back!</h1>
        <Button 
          variant="ghost" 
          onClick={() => setIsStatsModalOpen(true)}
          className="text-hashim-600"
        >
          View Stats
        </Button>
      </div>
      
      <AnimatedCard className="overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="workouts" className="flex items-center">
              <Dumbbell className="w-4 h-4 mr-2" />
              Workouts
            </TabsTrigger>
            <TabsTrigger value="nutrition" className="flex items-center">
              <Apple className="w-4 h-4 mr-2" />
              Nutrition
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="workouts" className="px-1 py-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Weekly Progress</h3>
                <Button 
                  variant="ghost" 
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => {/* View detailed progress */}}
                >
                  View All
                </Button>
              </div>
              
              <div className="h-52">
                <ProgressChart 
                  data={progressData} 
                  metrics={{
                    weight: true,
                    calories: true,
                    protein: true
                  }}
                />
              </div>
              
              <div className="pt-2">
                <SectionTitle title="This Week's Workouts" subtitle="Plan your fitness week ahead" />
                
                <div className="flex overflow-x-auto pb-2 space-x-2 scrollbar-none">
                  {days.map((day) => (
                    <DayTab
                      key={day.name}
                      day={day.name}
                      active={selectedDay === day.name}
                      onClick={() => setSelectedDay(day.name)}
                      hasWorkout={!!weeklyWorkouts[day.name]}
                    />
                  ))}
                </div>
                
                <div className="mt-4">
                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hashim-600"></div>
                    </div>
                  ) : weeklyWorkouts[selectedDay] ? (
                    <WorkoutCard 
                      workout={weeklyWorkouts[selectedDay]!} 
                      editable={true}
                      onExerciseComplete={(exerciseId, completed) => 
                        handleExerciseComplete(selectedDay, exerciseId, completed)
                      }
                      onAddExercise={(exercise) => 
                        handleAddExercise(selectedDay, exercise)
                      }
                      onRemoveExercise={(exerciseId) => 
                        handleRemoveExercise(selectedDay, exerciseId)
                      }
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center border rounded-xl border-dashed border-border bg-muted/30">
                      <p className="text-muted-foreground mb-3">No workout planned for {selectedDay}</p>
                      <Button 
                        onClick={() => setShowAddWorkout(true)}
                        className="flex items-center bg-hashim-600 hover:bg-hashim-700 text-white"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add a workout
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="nutrition" className="px-1 py-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Weekly Nutrition</h3>
                <Button 
                  variant="ghost" 
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => {/* View detailed nutrition */}}
                >
                  View All
                </Button>
              </div>
              
              <div className="h-52">
                <ProgressChart 
                  data={progressData}
                  metrics={{
                    calories: true,
                    protein: true,
                    carbs: true,
                    fat: true
                  }}
                />
              </div>
              
              {/* Nutrition content would go here */}
              <div className="flex justify-center py-8">
                <p className="text-muted-foreground">Nutrition tracking coming soon</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </AnimatedCard>
      
      <UserStatsModal 
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
      />
      
      <AddWorkoutModal
        isOpen={showAddWorkout}
        onClose={() => setShowAddWorkout(false)}
        onAddWorkout={handleAddWorkout}
        selectedDay={selectedDay}
      />
    </div>
  );
}
