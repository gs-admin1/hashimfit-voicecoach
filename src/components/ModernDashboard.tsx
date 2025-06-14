
import { useState } from "react";
import { format, startOfWeek, addDays } from "date-fns";
import { useUser } from "@/context/UserContext";
import { AddWorkoutModal } from "@/components/AddWorkoutModal";

// Import existing components (removing QuickActionsWidget)
import { WeeklyTimelineView } from "@/components/WeeklyTimelineView";

// Import new modern components
import { UserGreeting } from "@/components/dashboard/modern/UserGreeting";
import { HeroCTACard } from "@/components/dashboard/modern/HeroCTACard";
import { DailySnapshotRing } from "@/components/dashboard/modern/DailySnapshotRing";
import { StreakMomentumBadge } from "@/components/dashboard/modern/StreakMomentumBadge";
import { AIInsightTile } from "@/components/dashboard/modern/AIInsightTile";
import { CompletedItemsList } from "@/components/dashboard/modern/CompletedItemsList";
import { MetricsMicroCard } from "@/components/dashboard/modern/MetricsMicroCard";

// Import custom hooks (existing)
import { useDashboardData } from "@/hooks/useDashboardData";
import { useSelectedWorkout } from "@/hooks/useSelectedWorkout";
import { useDashboardMutations } from "@/hooks/useDashboardMutations";
import { useDashboardHandlers } from "@/hooks/useDashboardHandlers";

export function ModernDashboard() {
  const [selectedDay, setSelectedDay] = useState(format(new Date(), 'EEEE'));
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  
  const { user } = useUser();
  
  // Custom hooks for data and functionality (existing)
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
  const userName = user?.name || "Alex";

  // Mock data for new components (you can connect to real data later)
  const weeklyData = weekDates.map((date, index) => ({
    date,
    workoutTitle: index === 0 ? "Push Day" : index === 2 ? "Pull Day" : undefined,
    workoutType: index === 0 ? 'strength' as const : index === 2 ? 'cardio' as const : 'rest' as const,
    mealsLogged: Math.floor(Math.random() * 4) + 1,
    mealGoal: 4,
    habitCompletion: Math.floor(Math.random() * 100),
    isToday: format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
  }));

  const completedItems = [
    { type: 'workout' as const, name: 'Morning Push Workout', time: '8:30 AM', completed: true },
    { type: 'meal' as const, name: 'Protein Smoothie', time: '9:15 AM', completed: true },
    { type: 'meal' as const, name: 'Chicken Salad', time: '1:00 PM', completed: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Modern gradient background with enhanced pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.15),transparent),radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.15),transparent)]" />
      
      <div className="relative max-w-lg mx-auto pb-20">
        {/* User Greeting - Top of screen */}
        <div className="px-4 pt-6 pb-3">
          <UserGreeting userName={userName} />
          <StreakMomentumBadge streakDays={3} />
        </div>

        {/* Hero CTA - Primary action above the fold */}
        <div className="px-4 mb-4">
          <HeroCTACard 
            workout={selectedWorkout}
            onStartWorkout={() => selectedWorkout && handleStartWorkout(selectedWorkout)}
            onAddWorkout={() => setShowAddWorkout(true)}
            isLoading={isLoadingSelectedWorkout}
          />
        </div>

        {/* AI Insight Tile - Motivational coaching */}
        <div className="px-4 mb-4">
          <AIInsightTile onAskCoach={handleAskCoach} />
        </div>

        {/* Two-column layout for completed items and metrics - SWAPPED: CompletedItemsList first, DailySnapshotRing second */}
        <div className="px-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <CompletedItemsList items={completedItems} />
          <DailySnapshotRing 
            caloriesConsumed={1240}
            caloriesTarget={2100}
            proteinConsumed={85}
            proteinTarget={120}
          />
        </div>

        {/* Metrics Card - Moved below the swapped grid */}
        <div className="px-4 mb-4">
          <MetricsMicroCard 
            currentWeight={75.2}
            weightTrend="+0.3"
            lastLogDate="Today"
          />
        </div>

        {/* Weekly Overview - Keep existing WeeklyTimelineView */}
        <div className="px-4 mb-4">
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl shadow-lg border border-white/40 dark:border-slate-700/40 overflow-hidden">
            <WeeklyTimelineView
              weekData={weeklyData}
              selectedDate={selectedDate}
              onDaySelect={(date) => {
                const dayName = format(date, 'EEEE');
                setSelectedDay(dayName);
              }}
              onAddWorkout={() => setShowAddWorkout(true)}
              className="border-0 bg-transparent shadow-none"
            />
          </div>
        </div>
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
