
import { useState } from "react";
import { format, startOfWeek, addDays } from "date-fns";
import { useUser } from "@/context/UserContext";
import { WorkoutCard } from "@/components/WorkoutCard";
import { AddWorkoutModal } from "@/components/AddWorkoutModal";
import { Button } from "@/components/ui/button";
import { DayTab } from "@/components/DayTab";
import { AnimatedCard } from "@/components/ui-components";
import { Plus } from "lucide-react";

// Import new dashboard components
import { DailyOverviewCard } from "@/components/dashboard/DailyOverviewCard";
import { QuickActionsWidget } from "@/components/dashboard/QuickActionsWidget";
import { DailyWorkoutSummaryCard } from "@/components/dashboard/DailyWorkoutSummaryCard";
import { NutritionProgressCard } from "@/components/dashboard/NutritionProgressCard";
import { TDEEBalanceCard } from "@/components/dashboard/TDEEBalanceCard";
import { HabitStreakCard } from "@/components/dashboard/HabitStreakCard";
import { AICoachInsightCard } from "@/components/dashboard/AICoachInsightCard";

// Import custom hooks
import { useDashboardData } from "@/hooks/useDashboardData";
import { useSelectedWorkout } from "@/hooks/useSelectedWorkout";
import { useDashboardMutations } from "@/hooks/useDashboardMutations";
import { useDashboardHandlers } from "@/hooks/useDashboardHandlers";

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
  
  const { user } = useUser();
  
  // Custom hooks for data and functionality
  const { 
    weeklyWorkouts, 
    workoutSchedules, 
    isLoadingSchedules, 
    startOfCurrentWeek, 
    today 
  } = useDashboardData();
  
  const { scheduleWorkoutMutation, completeExerciseMutation } = useDashboardMutations();
  
  const {
    handleWorkoutUpdated,
    handleStartWorkout,
    handleContinueWorkout,
    handleEditWorkout,
    handleAskCoach,
    handleReplaceWorkout,
    handleUpdateWorkout,
    handleSnapMeal,
    handleLogWorkoutVoice,
    handleManualEntry,
    handleViewHabits,
    handleGenerateWorkout
  } = useDashboardHandlers();
  
  // Get the current week dates
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(startOfCurrentWeek, i));
  
  // Get the selected date
  const selectedDateIndex = weekDates.findIndex(date => 
    format(date, 'EEEE').toLowerCase() === selectedDay.toLowerCase()
  );
  const selectedDate = selectedDateIndex !== -1 ? weekDates[selectedDateIndex] : today;
  const selectedDateString = format(selectedDate, 'yyyy-MM-dd');

  const { selectedWorkout, isLoadingSelectedWorkout } = useSelectedWorkout(selectedDateString, workoutSchedules || []);

  const handleDaySelect = (day: string) => {
    console.log(`Selected day: ${day}`);
    setSelectedDay(day);
  };

  const handleWorkoutSelected = (workout: any) => {
    if (!workout || !workout.id) {
      return;
    }
    
    console.log(`Selected workout: ${workout.id}`);
    scheduleWorkoutMutation.mutate({
      workout_plan_id: workout.id,
      scheduled_date: selectedDateString
    });
    
    setShowAddWorkout(false);
  };

  const handleCompleteExercise = (exerciseId: string, exerciseName: string, completed: boolean) => {
    if (!selectedWorkout || !selectedWorkout.schedule_id) {
      return;
    }

    completeExerciseMutation.mutate({
      scheduleId: selectedWorkout.schedule_id,
      exerciseId,
      exerciseName,
      completed,
      allExercises: selectedWorkout.exercises,
      workoutSchedules: workoutSchedules || []
    });
  };

  const handleReplaceWorkoutClick = () => {
    const shouldOpenModal = handleReplaceWorkout();
    if (shouldOpenModal) {
      setShowAddWorkout(true);
    }
  };

  const toggleCardCollapse = (cardKey: keyof typeof cardStates) => {
    setCardStates(prev => ({
      ...prev,
      [cardKey]: !prev[cardKey]
    }));
  };

  // Get today's workout data for the overview card
  const todayWorkoutData = selectedWorkout ? {
    title: selectedWorkout.title,
    duration: selectedWorkout.estimatedDuration || 45,
    isCompleted: selectedWorkout.is_completed
  } : undefined;

  // Get user name from profile
  const userName = user?.name || "Alex";

  // Check if there are any scheduled workouts this week
  const hasScheduledWorkouts = workoutSchedules && workoutSchedules.length > 0;

  return (
    <div className="max-w-lg mx-auto pb-20">
      {/* 1. Daily Overview Card - Top Anchor */}
      <div className="mb-4">
        <DailyOverviewCard 
          userName={userName}
          todayWorkout={todayWorkoutData}
          mealsLogged={1}
          totalMeals={4}
          habitsCompleted={1}
          totalHabits={3}
          streakDays={3}
          onStartWorkout={() => selectedWorkout && handleStartWorkout(selectedWorkout)}
          onSnapMeal={handleSnapMeal}
          onViewHabits={handleViewHabits}
        />
      </div>

      {/* 2. Quick Actions Widget */}
      <div className="mb-4">
        <QuickActionsWidget 
          onLogWorkout={handleLogWorkoutVoice}
          onLogMeal={handleSnapMeal}
          onManualEntry={handleManualEntry}
        />
      </div>

      {/* 3. Reordered Dashboard Sections with reduced spacing */}
      <div className="space-y-3 mb-4">
        {/* Workout Today Card */}
        <div>
          <DailyWorkoutSummaryCard 
            isCollapsed={cardStates.workoutSummary}
            onToggleCollapse={() => toggleCardCollapse('workoutSummary')}
            workoutData={selectedWorkout}
            onContinueWorkout={handleContinueWorkout}
            onStartWorkout={() => selectedWorkout && handleStartWorkout(selectedWorkout)}
            onCompleteExercise={handleCompleteExercise}
            onGenerateWorkout={handleGenerateWorkout}
            onAddWorkout={() => setShowAddWorkout(true)}
            isLoading={isLoadingSelectedWorkout}
          />
        </div>
        
        {/* Nutrition Today */}
        <NutritionProgressCard 
          isCollapsed={cardStates.nutrition}
          onToggleCollapse={() => toggleCardCollapse('nutrition')}
          onLogMeal={handleSnapMeal}
        />
        
        {/* Habit Streaks */}
        <HabitStreakCard 
          isCollapsed={cardStates.habitStreak}
          onToggleCollapse={() => toggleCardCollapse('habitStreak')}
          onTrackHabits={handleViewHabits}
        />
        
        {/* Energy Balance */}
        <TDEEBalanceCard 
          isCollapsed={cardStates.tdeeBalance}
          onToggleCollapse={() => toggleCardCollapse('tdeeBalance')}
        />
        
        {/* AI Coach Insights */}
        <AICoachInsightCard 
          isCollapsed={cardStates.aiInsights}
          onToggleCollapse={() => toggleCardCollapse('aiInsights')}
          onCompleteWorkout={() => selectedWorkout && handleStartWorkout(selectedWorkout)}
        />
      </div>
      
      {/* Weekly Calendar - only show if there are scheduled workouts */}
      {hasScheduledWorkouts && (
        <>
          <div className="flex flex-nowrap overflow-x-auto mb-4 pb-1 scrollbar-none">
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
          
          {/* Legacy Workout Card - kept for day switching functionality */}
          <AnimatedCard className="mb-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold">📅 Weekly Schedule</h3>
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
                onStart={() => handleStartWorkout(selectedWorkout)}
                onEdit={handleEditWorkout}
                onAskCoach={handleAskCoach}
                onReplaceWorkout={handleReplaceWorkoutClick}
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
        </>
      )}
      
      <AddWorkoutModal 
        isOpen={showAddWorkout} 
        onClose={() => setShowAddWorkout(false)}
        onAddWorkout={handleWorkoutSelected}
        selectedDay={selectedDay}
      />
    </div>
  );
}
