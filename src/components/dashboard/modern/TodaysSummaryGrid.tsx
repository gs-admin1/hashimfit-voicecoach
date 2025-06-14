
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Target, CheckCircle, Utensils } from "lucide-react";

interface MealData {
  mealsLogged: number;
  mealGoal: number;
  caloriesConsumed: number;
  caloriesTarget: number;
  proteinConsumed: number;
  proteinTarget: number;
}

interface StreakData {
  currentStreak: number;
  weeklyGoal: number;
  completedThisWeek: number;
}

interface TodaysSummaryGridProps {
  mealData: MealData;
  streakData: StreakData;
  onLogMeal: () => void;
  onViewHabits: () => void;
}

export function TodaysSummaryGrid({ mealData, streakData, onLogMeal, onViewHabits }: TodaysSummaryGridProps) {
  const mealProgress = (mealData.mealsLogged / mealData.mealGoal) * 100;
  const calorieProgress = (mealData.caloriesConsumed / mealData.caloriesTarget) * 100;
  const weeklyProgress = (streakData.completedThisWeek / streakData.weeklyGoal) * 100;

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Meal Progress Card */}
      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-white/40 dark:border-slate-700/40 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <Utensils className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <Button
              onClick={onLogMeal}
              size="sm"
              variant="outline"
              className="h-8 px-3 text-xs"
            >
              <Camera className="h-3 w-3 mr-1" />
              Add
            </Button>
          </div>
          
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300 mb-1">
                <span>Meals</span>
                <span>{mealData.mealsLogged}/{mealData.mealGoal}</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(mealProgress, 100)}%` }}
                />
              </div>
            </div>
            
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {mealData.caloriesConsumed}/{mealData.caloriesTarget} cal
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Streak Card */}
      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-white/40 dark:border-slate-700/40 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
              <Target className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <Button
              onClick={onViewHabits}
              size="sm"
              variant="outline"
              className="h-8 px-3 text-xs"
            >
              View
            </Button>
          </div>
          
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300 mb-1">
                <span>This Week</span>
                <span>{streakData.completedThisWeek}/{streakData.weeklyGoal}</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(weeklyProgress, 100)}%` }}
                />
              </div>
            </div>
            
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
              <span className="text-lg mr-1">🔥</span>
              {streakData.currentStreak} day streak
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
