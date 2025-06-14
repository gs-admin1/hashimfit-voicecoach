
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, Target, Calendar } from "lucide-react";

interface WeeklyStreakCardProps {
  currentStreak: number;
  weeklyGoal: number;
  completedThisWeek: number;
  onViewHabits: () => void;
}

export function WeeklyStreakCard({ 
  currentStreak, 
  weeklyGoal, 
  completedThisWeek, 
  onViewHabits 
}: WeeklyStreakCardProps) {
  const weeklyProgress = (completedThisWeek / weeklyGoal) * 100;
  const remainingWorkouts = Math.max(0, weeklyGoal - completedThisWeek);

  return (
    <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-white/40 dark:border-slate-700/40 shadow-lg">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-slate-800 dark:text-white flex items-center">
            <Target className="h-5 w-5 mr-2 text-purple-500" />
            Weekly Progress
          </h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewHabits}
            className="text-purple-600 hover:text-purple-700 p-0"
          >
            <Calendar className="h-4 w-4" />
          </Button>
        </div>

        {/* Streak Display */}
        <div className="flex items-center justify-center mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Flame className="h-8 w-8 text-orange-500 mr-2" />
              <span className="text-3xl font-bold text-slate-800 dark:text-white">{currentStreak}</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">Day Streak</p>
          </div>
        </div>

        {/* Weekly Goal Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-600 dark:text-slate-300">Weekly Goal</span>
            <span className="font-medium text-slate-800 dark:text-white">
              {completedThisWeek}/{weeklyGoal} workouts
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-purple-500 to-violet-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(weeklyProgress, 100)}%` }}
            />
          </div>
        </div>

        {/* Motivational Message */}
        <div className="text-center mb-4">
          {remainingWorkouts > 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {remainingWorkouts} more workout{remainingWorkouts !== 1 ? 's' : ''} to hit your goal! 💪
            </p>
          ) : (
            <p className="text-sm text-green-600 dark:text-green-400">
              🎉 Weekly goal achieved! You're crushing it!
            </p>
          )}
        </div>

        <Button 
          variant="outline"
          size="sm"
          onClick={onViewHabits}
          className="w-full border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-300 dark:hover:bg-purple-900/30"
        >
          <Target className="h-4 w-4 mr-2" />
          View All Habits
        </Button>
      </CardContent>
    </Card>
  );
}
