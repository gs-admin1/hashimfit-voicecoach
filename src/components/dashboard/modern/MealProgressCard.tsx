
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Plus } from "lucide-react";

interface MealProgressCardProps {
  mealsLogged: number;
  mealGoal: number;
  caloriesConsumed: number;
  caloriesTarget: number;
  proteinConsumed: number;
  proteinTarget: number;
  onLogMeal: () => void;
}

export function MealProgressCard({ 
  mealsLogged, 
  mealGoal, 
  caloriesConsumed, 
  caloriesTarget, 
  proteinConsumed, 
  proteinTarget, 
  onLogMeal 
}: MealProgressCardProps) {
  const mealProgress = (mealsLogged / mealGoal) * 100;
  const calorieProgress = (caloriesConsumed / caloriesTarget) * 100;
  const proteinProgress = (proteinConsumed / proteinTarget) * 100;

  return (
    <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-white/40 dark:border-slate-700/40 shadow-lg">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-slate-800 dark:text-white flex items-center">
            <Camera className="h-5 w-5 mr-2 text-green-500" />
            Nutrition
          </h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogMeal}
            className="text-green-600 hover:text-green-700 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Meals Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-slate-600 dark:text-slate-300">Meals Today</span>
            <span className="font-medium text-slate-800 dark:text-white">{mealsLogged}/{mealGoal}</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(mealProgress, 100)}%` }}
            />
          </div>
        </div>

        {/* Calories & Protein */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Calories</div>
            <div className="text-sm font-medium text-slate-800 dark:text-white">
              {caloriesConsumed}/{caloriesTarget}
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1">
              <div 
                className="bg-orange-500 h-1 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(calorieProgress, 100)}%` }}
              />
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Protein</div>
            <div className="text-sm font-medium text-slate-800 dark:text-white">
              {proteinConsumed}g/{proteinTarget}g
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1">
              <div 
                className="bg-blue-500 h-1 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(proteinProgress, 100)}%` }}
              />
            </div>
          </div>
        </div>

        <Button 
          variant="outline"
          size="sm"
          onClick={onLogMeal}
          className="w-full border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-900/30"
        >
          <Camera className="h-4 w-4 mr-2" />
          Log Meal
        </Button>
      </CardContent>
    </Card>
  );
}
