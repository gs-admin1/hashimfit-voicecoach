
import { useState, useEffect } from "react";
import { Logo } from "@/components/Logo";
import { NavigationBar } from "@/components/ui-components";
import { ChatFAB } from "@/components/ChatFAB";
import { WeeklyCalendarStrip } from "@/components/WeeklyCalendarStrip";
import { DailySummaryCard } from "@/components/DailySummaryCard";
import { AICoachBanner } from "@/components/AICoachBanner";
import { WeeklyAnalytics } from "@/components/WeeklyAnalytics";
import { PlanningFAB } from "@/components/PlanningFAB";
import { AddWorkoutModal } from "@/components/AddWorkoutModal";
import { useToast } from "@/hooks/use-toast";
import { WorkoutService } from "@/lib/supabase/services/WorkoutService";
import { NutritionService } from "@/lib/supabase/services/NutritionService";
import { format, startOfWeek, endOfWeek, addDays, parseISO, isSameDay } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

export default function PlannerPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [weekData, setWeekData] = useState<any[]>([]);
  const [selectedDayData, setSelectedDayData] = useState<any>(null);
  const [aiInsights, setAIInsights] = useState<any[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<any>(null);
  const { toast } = useToast();
  const { userId } = useAuth();
  
  // Load weekly data
  useEffect(() => {
    if (!userId) return;
    
    const loadWeeklyData = async () => {
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
      const startStr = format(weekStart, 'yyyy-MM-dd');
      const endStr = format(weekEnd, 'yyyy-MM-dd');
      
      try {
        // Load workout schedules
        const schedules = await WorkoutService.getWorkoutSchedule(userId, startStr, endStr);
        
        // Load nutrition logs for the week
        const nutritionSummary = await NutritionService.getNutritionalSummary(userId, startStr, endStr);
        
        // Process week data
        const processedWeekData = [];
        for (let i = 0; i < 7; i++) {
          const currentDate = addDays(weekStart, i);
          const dateStr = format(currentDate, 'yyyy-MM-dd');
          
          const daySchedules = schedules.filter(s => s.scheduled_date === dateStr);
          const dayNutrition = nutritionSummary.find(n => n.log_date === dateStr);
          
          processedWeekData.push({
            date: currentDate,
            hasWorkout: daySchedules.length > 0,
            hasMeals: !!dayNutrition,
            calorieStatus: dayNutrition 
              ? (dayNutrition.total_calories > 2000 ? 'good' : dayNutrition.total_calories > 1500 ? 'warning' : 'poor')
              : 'none'
          });
        }
        
        setWeekData(processedWeekData);
        
        // Calculate weekly stats
        const completedWorkouts = schedules.filter(s => s.is_completed).length;
        const totalScheduled = schedules.length;
        const nutritionDays = nutritionSummary.length;
        
        setWeeklyStats({
          workoutCompletion: totalScheduled > 0 ? Math.round((completedWorkouts / totalScheduled) * 100) : 0,
          nutritionCompliance: Math.round((nutritionDays / 7) * 100),
          habitsCompleted: 12, // Mock data
          totalHabits: 21, // Mock data
          progressTrend: 'up',
          weeklyGoals: {
            workouts: { completed: completedWorkouts, target: 4 },
            calories: { avg: 1800, target: 2000 },
            protein: { avg: 120, target: 150 }
          }
        });
        
      } catch (error) {
        console.error("Error loading weekly data:", error);
      }
    };
    
    loadWeeklyData();
  }, [userId, selectedDate]);
  
  // Load selected day data
  useEffect(() => {
    if (!userId) return;
    
    const loadDayData = async () => {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      try {
        // Load workout for the day
        const schedules = await WorkoutService.getWorkoutSchedule(userId, dateStr, dateStr);
        let workout = null;
        
        if (schedules.length > 0) {
          const schedule = schedules[0];
          const workoutPlan = await WorkoutService.getWorkoutPlanById(schedule.workout_plan_id);
          const exercises = await WorkoutService.getWorkoutExercises(schedule.workout_plan_id);
          
          if (workoutPlan) {
            workout = {
              id: workoutPlan.id,
              title: workoutPlan.title,
              duration: 45,
              bodyFocus: workoutPlan.target_muscles || ['Full Body'],
              isCompleted: schedule.is_completed,
              exercises: exercises.length
            };
          }
        }
        
        // Load meals for the day
        const mealLogs = await NutritionService.getMealLogsForDate(userId, dateStr);
        
        // Mock habits data
        const habits = [
          { id: '1', name: 'Water Intake', isCompleted: true, target: 8, current: 6, unit: 'glasses' },
          { id: '2', name: 'Sleep 8 hours', isCompleted: false },
          { id: '3', name: 'Take Vitamins', isCompleted: true },
        ];
        
        setSelectedDayData({
          workout,
          meals: mealLogs || [],
          habits
        });
        
      } catch (error) {
        console.error("Error loading day data:", error);
      }
    };
    
    loadDayData();
  }, [userId, selectedDate]);
  
  // Generate AI insights
  useEffect(() => {
    const insights = [
      {
        type: 'suggestion',
        title: 'Muscle Balance',
        message: "You've focused on upper body this week. Consider adding a leg workout tomorrow.",
        action: 'Add Leg Day'
      },
      {
        type: 'warning',
        title: 'Protein Goal',
        message: "You've been under your protein target for 3 days. Would you like meal suggestions?",
        action: 'View Protein-Rich Meals'
      }
    ];
    
    setAIInsights(insights);
  }, []);
  
  const handleOptimizeWeek = async () => {
    toast({
      title: "AI Coach Optimization",
      description: "Analyzing your week and generating personalized recommendations...",
    });
    
    // TODO: Implement AI optimization logic
  };
  
  const handleDismissInsight = (index: number) => {
    setAIInsights(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleAddWorkout = () => {
    setShowAddWorkout(true);
  };
  
  const handleAddNutrition = () => {
    toast({
      title: "Add Nutrition Plan",
      description: "Nutrition planning feature coming soon!",
    });
  };
  
  const handleWorkoutSelected = (workout: any) => {
    // TODO: Implement workout scheduling logic
    setShowAddWorkout(false);
    toast({
      title: "Workout Scheduled",
      description: `${workout.title} has been added to ${format(selectedDate, 'MMM d')}.`,
    });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-border sticky top-0 z-30">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <Logo />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Weekly Planner</h1>
        </div>
      </header>
      
      <WeeklyCalendarStrip
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        weekData={weekData}
      />
      
      <main className="pt-4 px-4 pb-32 max-w-lg mx-auto space-y-6">
        {/* AI Coach Banner */}
        <AICoachBanner
          insights={aiInsights}
          onOptimizeWeek={handleOptimizeWeek}
          onDismissInsight={handleDismissInsight}
        />
        
        {/* Daily Summary */}
        {selectedDayData && (
          <DailySummaryCard
            date={selectedDate}
            workout={selectedDayData.workout}
            meals={selectedDayData.meals}
            habits={selectedDayData.habits}
            onAddWorkout={handleAddWorkout}
            onAddMeal={handleAddNutrition}
            onEditWorkout={(workout) => {
              toast({
                title: "Edit Workout",
                description: "Workout editing feature coming soon!",
              });
            }}
          />
        )}
        
        {/* Weekly Analytics */}
        {weeklyStats && (
          <WeeklyAnalytics stats={weeklyStats} />
        )}
      </main>
      
      <PlanningFAB
        onAddWorkout={handleAddWorkout}
        onAddNutrition={handleAddNutrition}
      />
      
      <NavigationBar />
      <ChatFAB />
      
      <AddWorkoutModal 
        isOpen={showAddWorkout} 
        onClose={() => setShowAddWorkout(false)}
        onAddWorkout={handleWorkoutSelected}
        selectedDay={format(selectedDate, 'EEEE')}
      />
    </div>
  );
}
