
import { useState } from "react";
import { format, startOfWeek, addDays } from "date-fns";
import { useUser } from "@/context/UserContext";
import { AddWorkoutModal } from "@/components/AddWorkoutModal";

// Import existing components
import { WeeklyTimelineView } from "@/components/WeeklyTimelineView";

// Import redesigned modern components
import { HeroWorkoutCard } from "@/components/dashboard/modern/HeroWorkoutCard";
import { QuickStatsBar } from "@/components/dashboard/modern/QuickStatsBar";
import { MealProgressCard } from "@/components/dashboard/modern/MealProgressCard";
import { WeeklyStreakCard } from "@/components/dashboard/modern/WeeklyStreakCard";
import { AIMotivationBlock } from "@/components/dashboard/modern/AIMotivationBlock";
import { CommunityFeedPreview } from "@/components/dashboard/modern/CommunityFeedPreview";
import { GamificationHighlights } from "@/components/dashboard/modern/GamificationHighlights";
import { TodaysSummaryGrid } from "@/components/dashboard/modern/TodaysSummaryGrid";

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

  // Mock data for new components (connect to real data later)
  const userStats = {
    currentStreak: 5,
    weeklyGoal: 5,
    completedThisWeek: 3,
    xpPoints: 2840,
    level: 8,
    nextLevelXP: 3000
  };

  const mealData = {
    mealsLogged: 2,
    mealGoal: 4,
    caloriesConsumed: 1240,
    caloriesTarget: 2100,
    proteinConsumed: 85,
    proteinTarget: 120
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Enhanced gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent),radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.1),transparent)]" />
      
      <div className="relative max-w-lg mx-auto pb-32">
        {/* Quick Stats Bar - Always visible at top */}
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/20 dark:border-slate-700/20">
          <QuickStatsBar 
            userName={userName}
            streak={userStats.currentStreak}
            xpPoints={userStats.xpPoints}
            level={userStats.level}
            nextLevelXP={userStats.nextLevelXP}
          />
        </div>

        {/* Hero Workout Card - Primary CTA above the fold */}
        <div className="px-4 pt-4 pb-3">
          <HeroWorkoutCard 
            workout={selectedWorkout}
            onStartWorkout={() => selectedWorkout && handleStartWorkout(selectedWorkout)}
            onAddWorkout={() => setShowAddWorkout(true)}
            onGenerateWorkout={handleGenerateWorkout}
            isLoading={isLoadingSelectedWorkout}
          />
        </div>

        {/* Today's Summary Grid - Key metrics without scrolling */}
        <div className="px-4 mb-4">
          <TodaysSummaryGrid 
            mealData={mealData}
            streakData={userStats}
            onLogMeal={handleSnapMeal}
            onViewHabits={handleViewHabits}
          />
        </div>

        {/* AI Motivation Block - Personalized coaching */}
        <div className="px-4 mb-4">
          <AIMotivationBlock 
            userName={userName}
            streakDays={userStats.currentStreak}
            weeklyProgress={userStats.completedThisWeek}
            weeklyGoal={userStats.weeklyGoal}
            onAskCoach={handleAskCoach}
          />
        </div>

        {/* Gamification Highlights - Badges and achievements */}
        <div className="px-4 mb-4">
          <GamificationHighlights 
            recentBadges={['🔥 5-Day Streak', '💪 Push Day Pro', '📸 Meal Logger']}
            weeklyChallenge="30-Day Burn Challenge"
            onJoinChallenge={() => console.log('Join challenge')}
            onInviteFriends={() => console.log('Invite friends')}
          />
        </div>

        {/* Community Feed Preview - Social engagement */}
        <div className="px-4 mb-4">
          <CommunityFeedPreview 
            groupActivity="Your group is crushing it! 🔥"
            recentPosts={[
              { user: "Sarah M.", activity: "completed Push Day workout", time: "2h ago" },
              { user: "Mike R.", activity: "hit 5-day streak", time: "4h ago" }
            ]}
            onViewCommunity={() => console.log('View community')}
          />
        </div>

        {/* Weekly Timeline - Visual progress tracking */}
        <div className="px-4 mb-4">
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl shadow-lg border border-white/40 dark:border-slate-700/40 overflow-hidden">
            <div className="p-4 border-b border-slate-200/20 dark:border-slate-700/20">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">This Week's Journey</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">Track your consistency</p>
            </div>
            <WeeklyTimelineView
              weekData={weekDates.map((date, index) => ({
                date,
                workoutTitle: index === 0 ? "Push Day" : index === 2 ? "Pull Day" : undefined,
                workoutType: index === 0 ? 'strength' as const : index === 2 ? 'cardio' as const : 'rest' as const,
                mealsLogged: Math.floor(Math.random() * 4) + 1,
                mealGoal: 4,
                habitCompletion: Math.floor(Math.random() * 100),
                isToday: format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
              }))}
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
