
import { useState, useEffect } from "react";
import { Logo } from "@/components/Logo";
import { NavigationBar } from "@/components/ui-components";
import { ChatFAB } from "@/components/ChatFAB";
import { 
  Calendar,
  ChevronLeft, 
  ChevronRight,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { WorkoutService, WorkoutSchedule } from "@/lib/supabase/services/WorkoutService";
import { format, startOfWeek, endOfWeek, addDays, isSameDay, parseISO } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { AddWorkoutModal } from "@/components/AddWorkoutModal";

interface WorkoutSession {
  id: string;
  date: Date;
  title: string;
  duration: number;
  notes?: string;
  type: "strength" | "cardio" | "flexibility" | "recovery";
  exercises: Array<{
    id: string;
    name: string;
    sets: number;
    reps: string;
    weight: string;
  }>;
}

export default function PlannerPage() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 0 })); // Sunday start
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { toast } = useToast();
  const { userId } = useAuth();
  
  // Load scheduled workouts for the current week
  useEffect(() => {
    if (!userId) return;
    
    const loadWeeklySchedule = async () => {
      const weekStart = format(currentWeekStart, 'yyyy-MM-dd');
      const weekEnd = format(endOfWeek(currentWeekStart, { weekStartsOn: 0 }), 'yyyy-MM-dd');
      
      console.log(`Fetching workouts from ${weekStart} to ${weekEnd}`);
      
      try {
        const schedules = await WorkoutService.getWorkoutSchedule(userId, weekStart, weekEnd);
        
        console.log(`Found ${schedules.length} scheduled workouts`);
        
        if (schedules && schedules.length > 0) {
          const workoutSessions: WorkoutSession[] = [];
          
          // Fetch workout details for each schedule
          for (const schedule of schedules) {
            if (schedule.workout_plan_id) {
              try {
                const workoutPlan = await WorkoutService.getWorkoutPlanById(schedule.workout_plan_id);
                
                if (workoutPlan) {
                  // Map category to workout type or default to "strength"
                  let workoutType: "strength" | "cardio" | "flexibility" | "recovery" = "strength";
                  
                  if (workoutPlan.category === "cardio") {
                    workoutType = "cardio";
                  } else if (workoutPlan.category === "recovery") {
                    workoutType = "recovery";
                  } else if (workoutPlan.category === "hiit") {
                    workoutType = "flexibility";
                  }
                  
                  // Fetch exercises for this workout plan
                  const exercises = await WorkoutService.getWorkoutExercises(schedule.workout_plan_id);
                  
                  workoutSessions.push({
                    id: schedule.id || '',
                    date: parseISO(schedule.scheduled_date),
                    title: workoutPlan.title,
                    duration: schedule.duration ? parseInt(schedule.duration.toString()) : 45,
                    notes: schedule.notes,
                    type: workoutType,
                    exercises: exercises.map(ex => ({
                      id: ex.id || '',
                      name: ex.name,
                      sets: ex.sets,
                      reps: ex.reps,
                      weight: ex.weight || 'bodyweight'
                    }))
                  });
                }
              } catch (err) {
                console.error(`Error fetching workout plan ${schedule.workout_plan_id}:`, err);
              }
            }
          }
          
          setSessions(workoutSessions);
        } else {
          setSessions([]);
        }
      } catch (error) {
        console.error("Error loading weekly schedule:", error);
        toast({
          title: "Error",
          description: "Failed to load your workout schedule.",
          variant: "destructive"
        });
      }
    };
    
    loadWeeklySchedule();
  }, [userId, currentWeekStart, toast]);
  
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeekStart = direction === 'prev'
      ? addDays(currentWeekStart, -7)
      : addDays(currentWeekStart, 7);
    setCurrentWeekStart(newWeekStart);
  };

  // Get day names for the current week
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(currentWeekStart, i);
    return {
      date: day,
      name: format(day, 'EEEE'),
      formattedDate: format(day, 'MMM d')
    };
  });

  // Filter sessions for the selected date
  const getSessionsForDay = (date: Date) => {
    return sessions.filter(session => isSameDay(session.date, date));
  };

  // Handle adding a new workout
  const handleAddWorkout = (date: Date) => {
    setSelectedDate(date);
    setShowAddWorkout(true);
  };

  // Handle workout submission from the modal
  const handleWorkoutSelected = (workout: any) => {
    if (!workout || !workout.id) {
      toast({
        title: "Error",
        description: "Please select a valid workout.",
        variant: "destructive"
      });
      return;
    }
    
    // Schedule the workout for the selected date
    const scheduledDate = format(selectedDate, 'yyyy-MM-dd');
    console.log(`Scheduling workout: ${workout.id} for date: ${scheduledDate}`);
    
    scheduleWorkout(workout.id, scheduledDate);
    setShowAddWorkout(false);
  };

  // Function to schedule a workout
  const scheduleWorkout = async (workoutPlanId: string, scheduledDate: string) => {
    if (!userId) return;
    
    try {
      const schedule: WorkoutSchedule = {
        user_id: userId,
        workout_plan_id: workoutPlanId,
        scheduled_date: scheduledDate,
        is_completed: false
      };
      
      const result = await WorkoutService.scheduleWorkout(schedule);
      
      if (result) {
        toast({
          title: "Success",
          description: "Workout has been scheduled successfully."
        });
        
        // Reload the schedule to show the new workout
        const weekStart = format(currentWeekStart, 'yyyy-MM-dd');
        const weekEnd = format(endOfWeek(currentWeekStart, { weekStartsOn: 0 }), 'yyyy-MM-dd');
        const schedules = await WorkoutService.getWorkoutSchedule(userId, weekStart, weekEnd);
        
        if (schedules && schedules.length > 0) {
          // Same code as in useEffect to fetch workout details
          const workoutSessions: WorkoutSession[] = [];
          
          for (const schedule of schedules) {
            if (schedule.workout_plan_id) {
              try {
                const workoutPlan = await WorkoutService.getWorkoutPlanById(schedule.workout_plan_id);
                
                if (workoutPlan) {
                  let workoutType: "strength" | "cardio" | "flexibility" | "recovery" = "strength";
                  
                  if (workoutPlan.category === "cardio") {
                    workoutType = "cardio";
                  } else if (workoutPlan.category === "recovery") {
                    workoutType = "recovery";
                  } else if (workoutPlan.category === "hiit") {
                    workoutType = "flexibility";
                  }
                  
                  const exercises = await WorkoutService.getWorkoutExercises(schedule.workout_plan_id);
                  
                  workoutSessions.push({
                    id: schedule.id || '',
                    date: parseISO(schedule.scheduled_date),
                    title: workoutPlan.title,
                    duration: schedule.duration ? parseInt(schedule.duration.toString()) : 45,
                    notes: schedule.notes,
                    type: workoutType,
                    exercises: exercises.map(ex => ({
                      id: ex.id || '',
                      name: ex.name,
                      sets: ex.sets,
                      reps: ex.reps,
                      weight: ex.weight || 'bodyweight'
                    }))
                  });
                }
              } catch (err) {
                console.error(`Error fetching workout plan ${schedule.workout_plan_id}:`, err);
              }
            }
          }
          
          setSessions(workoutSessions);
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to schedule workout.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error scheduling workout:", error);
      toast({
        title: "Error",
        description: "Failed to schedule workout.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-hashim-50/50 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-border sticky top-0 z-10 animate-fade-in">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <Logo />
        </div>
      </header>
      
      <main className="pt-4 px-4 animate-fade-in pb-20">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold mb-6">Workout Planner</h1>
          
          <div className="flex justify-between items-center mb-6">
            <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
              <ChevronLeft size={16} className="mr-1" />
              Previous
            </Button>
            <div className="font-medium">
              <Calendar size={16} className="inline mr-2" />
              {format(currentWeekStart, 'MMMM yyyy')}
            </div>
            <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
              Next
              <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>
          
          <div className="space-y-2 mb-6">
            {weekDays.map(day => (
              <div key={day.name} className="bg-white dark:bg-gray-800 rounded-lg border p-4 shadow-sm">
                <div className="font-medium mb-2">{day.name} ({day.formattedDate})</div>
                
                {getSessionsForDay(day.date).length > 0 ? (
                  <div className="space-y-2">
                    {getSessionsForDay(day.date).map(session => (
                      <div 
                        key={session.id} 
                        className="bg-hashim-50 dark:bg-hashim-900/20 rounded p-3"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{session.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              <span className="bg-hashim-100 text-hashim-700 text-xs font-medium px-2 py-0.5 rounded">
                                {session.type.charAt(0).toUpperCase() + session.type.slice(1)}
                              </span>
                            </p>
                          </div>
                        </div>
                        
                        {/* Display exercises for this workout */}
                        {session.exercises && session.exercises.length > 0 && (
                          <div className="mt-3 border-t pt-2">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Exercises:</p>
                            <ul className="text-sm space-y-1">
                              {session.exercises.map(exercise => (
                                <li key={exercise.id} className="flex items-start">
                                  <span className="text-xs text-hashim-600 mr-1">•</span>
                                  <span>{exercise.name} - {exercise.sets} sets × {exercise.reps} reps {exercise.weight !== 'bodyweight' ? `(${exercise.weight})` : ''}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {session.notes && (
                          <p className="text-sm mt-2 text-muted-foreground">{session.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-3 text-sm text-muted-foreground border border-dashed rounded">
                    <p className="mb-2">No workouts scheduled</p>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="flex items-center mx-auto"
                      onClick={() => handleAddWorkout(day.date)}
                    >
                      <Plus size={16} className="mr-1" />
                      Add a workout
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
      
      <NavigationBar />
      <ChatFAB />
      
      {/* Add Workout Modal */}
      <AddWorkoutModal 
        isOpen={showAddWorkout} 
        onClose={() => setShowAddWorkout(false)}
        onAddWorkout={handleWorkoutSelected}
        selectedDay={format(selectedDate, 'EEEE')}
      />
    </div>
  );
}
