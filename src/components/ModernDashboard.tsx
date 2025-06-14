
import { useState } from "react";
import { format, startOfWeek, addDays } from "date-fns";
import { useUser } from "@/context/UserContext";
import { AddWorkoutModal } from "@/components/AddWorkoutModal";

// Import modern dashboard components
import { HeroCTACard } from "@/components/dashboard/modern/HeroCTACard";
import { QuickLoggingHub } from "@/components/dashboard/modern/QuickLoggingHub";
import { DailySnapshotRing } from "@/components/dashboard/modern/DailySnapshotRing";
import { WeeklyOverviewCarousel } from "@/components/dashboard/modern/WeeklyOverviewCarousel";
import { CompletedItemsList } from "@/components/dashboard/modern/CompletedItemsList";
import { AIInsightTile } from "@/components/dashboard/modern/AIInsightTile";
import { StreakMomentumBadge } from "@/components/dashboard/modern/StreakMomentumBadge";
import { MetricsMicroCard } from "@/components/dashboard/modern/MetricsMicroCard";
import { UserGreeting } from "@/components/dashboard/modern/UserGreeting";

// Import custom hooks
import { useDashboardData } from "@/hooks/useDashboardData";
import { useSelectedWorkout } from "@/hooks/useSelectedWorkout";
import { useDashboardMutations } from "@/hooks/useDashboardMutations";
import { useDashboardHandlers } from "@/hooks/useDashboardHandlers";

export function ModernDashboard() {
  const [selectedDay, setSelectedDay] = useState(format(new Date(), 'EEEE'));
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  
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

  // Get user name from profile
  const userName = user?.name || "Champion";

  // Mock data for demonstration - in real app this would come from APIs
  const dailyProgress = {
    calories: { consumed: 1650, burned: 2100, target: 2000 },
    protein: { consumed: 85, target: 150 },
    completedWorkouts: selectedWorkout?.is_completed ? 1 : 0,
    targetWorkouts: 1,
    streak: 3
  };

  const weeklyData = weekDates.map((date, index) => ({
    date,
    dayName: format(date, 'EEE'),
    isToday: format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd'),
    workoutCompleted: Math.random() > 0.3, // Mock data
    mealsLogged: Math.floor(Math.random() * 4) + 1,
    aiNote: index === 3 ? "Perfect protein day! 🥇" : null
  }));

  const completedItems = [
    ...(selectedWorkout?.is_completed ? [{ 
      type: 'workout' as const, 
      title: selectedWorkout.title, 
      time: '8:30 AM',
      icon: '💪'
    }] : []),
    { type: 'meal' as const, title: 'Breakfast', time: '7:15 AM', icon: '🥣' },
    { type: 'habit' as const, title: 'Morning Water', time: '6:45 AM', icon: '💧' }
  ];

  const aiInsight = {
    message: "Your protein intake is 43% higher this week! Try adding Greek yogurt for an extra 15g tomorrow 🥛",
    type: 'positive' as const,
    actionText: "View Nutrition Tips"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-emerald-50 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-lg mx-auto pb-24 px-4 pt-2">
        {/* User Greeting */}
        <UserGreeting 
          userName={userName}
          timeOfDay={new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}
          className="mb-4"
        />

        {/* Hero CTA - Today's Workout */}
        <HeroCTACard 
          workout={selectedWorkout}
          onStartWorkout={() => selectedWorkout && handleStartWorkout(selectedWorkout)}
          onAddWorkout={() => setShowAddWorkout(true)}
          isLoading={isLoadingSelectedWorkout}
          className="mb-6"
        />

        {/* Quick Logging Hub */}
        <QuickLoggingHub 
          onLogMeal={handleSnapMeal}
          onLogWorkout={handleLogWorkoutVoice}
          className="mb-6"
        />

        {/* Daily Snapshot Ring */}
        <DailySnapshotRing 
          progress={dailyProgress}
          className="mb-6"
        />

        {/* Streak & Momentum Badge */}
        <StreakMomentumBadge 
          streak={dailyProgress.streak}
          momentum="up"
          className="mb-6"
        />

        {/* AI Insight Tile */}
        <AIInsightTile 
          insight={aiInsight}
          onAction={handleAskCoach}
          className="mb-6"
        />

        {/* Weekly Overview Carousel */}
        <WeeklyOverviewCarousel 
          weekData={weeklyData}
          className="mb-6"
        />

        {/* Completed Items List */}
        <CompletedItemsList 
          items={completedItems}
          onViewAll={() => {}}
          className="mb-6"
        />

        {/* Metrics Micro Card */}
        <MetricsMicroCard 
          weight={{ current: 75, change: -0.5, trend: 'down' }}
          bodyFat={{ current: 15, change: -0.2, trend: 'down' }}
          className="mb-6"
        />
      </div>
      
      <AddWorkoutModal 
        isOpen={showAddWorkout} 
        onClose={() => setShowAddWorkout(false)}
        onAddWorkout={handleWorkoutSelected}
        selectedDay={selectedDay}
      />
    </div>
  );
}
