
import { useState, useEffect } from "react";
import { Logo } from "@/components/Logo";
import { NavigationBar } from "@/components/ui-components";
import { ChatFAB } from "@/components/ChatFAB";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Calendar,
  ChevronLeft, 
  ChevronRight,
  Clock
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel 
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { WorkoutService, WorkoutSchedule } from "@/lib/supabase/services/WorkoutService";
import { format, startOfWeek, endOfWeek, addDays, isSameDay, parseISO } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

interface WorkoutSession {
  id: string;
  date: Date;
  title: string;
  duration: number;
  notes?: string;
  type: "strength" | "cardio" | "flexibility" | "recovery";
}

export default function PlannerPage() {
  const [showLogDialog, setShowLogDialog] = useState(false);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 0 })); // Sunday start
  const { toast } = useToast();
  const { userId } = useAuth();
  
  const workoutTypes = [
    { value: "strength", label: "Strength Training" },
    { value: "cardio", label: "Cardio" },
    { value: "flexibility", label: "Flexibility & Mobility" },
    { value: "recovery", label: "Recovery" },
  ];

  const form = useForm({
    defaultValues: {
      title: "",
      date: new Date().toISOString().split("T")[0],
      duration: 45,
      notes: "",
      type: "strength" as const,
    },
  });

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
                  } else if (workoutPlan.category === "hiit" || workoutPlan.category === "flexibility") {
                    workoutType = "flexibility";
                  }
                  
                  workoutSessions.push({
                    id: schedule.id || '',
                    date: parseISO(schedule.scheduled_date),
                    title: workoutPlan.title,
                    duration: schedule.duration ? parseInt(schedule.duration.toString()) : 45,
                    notes: schedule.notes,
                    type: workoutType
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

  const onSubmit = async (data: any) => {
    if (!userId) {
      toast({
        title: "Authentication Required",
        description: "Please log in to schedule workouts.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Create a workout plan first
      const workoutPlan = await WorkoutService.createWorkoutPlan({
        user_id: userId,
        title: data.title,
        description: data.notes,
        category: data.type,
        difficulty: 3, // Medium difficulty by default
      });
      
      if (!workoutPlan || !workoutPlan.id) {
        throw new Error("Failed to create workout plan");
      }
      
      // Now schedule the workout with the newly created plan
      const schedule: WorkoutSchedule = {
        user_id: userId,
        workout_plan_id: workoutPlan.id,
        scheduled_date: data.date,
        duration: data.duration,
        notes: data.notes,
        is_completed: false
      };
      
      const scheduleId = await WorkoutService.scheduleWorkout(schedule);
      
      if (scheduleId) {
        // Add to local sessions state
        const newSession: WorkoutSession = {
          id: scheduleId,
          date: new Date(data.date),
          title: data.title,
          duration: data.duration,
          notes: data.notes,
          type: data.type,
        };
        
        setSessions(prev => [...prev, newSession]);
        setShowLogDialog(false);
        form.reset();
        
        toast({
          title: "Workout scheduled",
          description: "Your workout has been scheduled.",
        });
        
        // Refresh the weekly schedule
        const weekStart = format(currentWeekStart, 'yyyy-MM-dd');
        const weekEnd = format(endOfWeek(currentWeekStart, { weekStartsOn: 0 }), 'yyyy-MM-dd');
        const refreshedSchedules = await WorkoutService.getWorkoutSchedule(userId, weekStart, weekEnd);
        
        if (refreshedSchedules && refreshedSchedules.length > 0) {
          const refreshedSessions: WorkoutSession[] = [];
          
          for (const schedule of refreshedSchedules) {
            if (schedule.workout_plan_id) {
              const workoutPlan = await WorkoutService.getWorkoutPlanById(schedule.workout_plan_id);
              
              if (workoutPlan) {
                let workoutType: "strength" | "cardio" | "flexibility" | "recovery" = "strength";
                
                if (workoutPlan.category === "cardio") {
                  workoutType = "cardio";
                } else if (workoutPlan.category === "recovery") {
                  workoutType = "recovery";
                } else if (workoutPlan.category === "hiit" || workoutPlan.category === "flexibility") {
                  workoutType = "flexibility";
                }
                
                refreshedSessions.push({
                  id: schedule.id || '',
                  date: parseISO(schedule.scheduled_date),
                  title: workoutPlan.title,
                  duration: schedule.duration ? parseInt(schedule.duration.toString()) : 45,
                  notes: schedule.notes,
                  type: workoutType
                });
              }
            }
          }
          
          setSessions(refreshedSessions);
        }
      } else {
        throw new Error("Failed to schedule workout");
      }
    } catch (error) {
      console.error("Error scheduling workout:", error);
      toast({
        title: "Error",
        description: "Failed to schedule your workout. Please try again.",
        variant: "destructive"
      });
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-hashim-50/50 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-border sticky top-0 z-10 animate-fade-in">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <Logo />
          <Button 
            className="bg-hashim-600 hover:bg-hashim-700 text-white"
            onClick={() => setShowLogDialog(true)}
          >
            <Plus size={16} className="mr-2" />
            Log Workout Session
          </Button>
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
                            <p className="text-sm text-muted-foreground flex items-center mt-1">
                              <Clock size={14} className="mr-1" />
                              {session.duration} min
                              <span className="mx-2">•</span>
                              <span className="bg-hashim-100 text-hashim-700 text-xs font-medium px-2 py-0.5 rounded">
                                {workoutTypes.find(t => t.value === session.type)?.label}
                              </span>
                            </p>
                          </div>
                        </div>
                        {session.notes && (
                          <p className="text-sm mt-2 text-muted-foreground">{session.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-3 text-sm text-muted-foreground border border-dashed rounded">
                    No workouts scheduled
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
      
      <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Log Workout Session</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workout Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Upper Body Strength" required {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" required {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (mins)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={5} 
                          max={300} 
                          required
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workout Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select workout type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {workoutTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="How was your workout? Any personal records?"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowLogDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-hashim-600 hover:bg-hashim-700 text-white">
                  Save Workout
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <NavigationBar />
      <ChatFAB />
    </div>
  );
}
