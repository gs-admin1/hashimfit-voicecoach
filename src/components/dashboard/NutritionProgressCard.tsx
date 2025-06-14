
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronDown, ChevronUp, Utensils, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

interface NutritionData {
  calories: { consumed: number; target: number; };
  protein: { consumed: number; target: number; };
  carbs: { consumed: number; target: number; };
  fat: { consumed: number; target: number; };
  water: { consumed: number; target: number; };
}

interface NutritionProgressCardProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  nutritionData?: NutritionData;
  onLogMeal?: () => void;
  className?: string;
}

export function NutritionProgressCard({ 
  isCollapsed = false, 
  onToggleCollapse,
  nutritionData,
  onLogMeal,
  className
}: NutritionProgressCardProps) {
  const [localCollapsed, setLocalCollapsed] = useState(isCollapsed);
  
  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setLocalCollapsed(!localCollapsed);
    }
  };
  
  const collapsed = onToggleCollapse ? isCollapsed : localCollapsed;

  // Mock data when no nutrition data is provided
  const mockData: NutritionData = {
    calories: { consumed: 1250, target: 2200 },
    protein: { consumed: 85, target: 150 },
    carbs: { consumed: 120, target: 250 },
    fat: { consumed: 45, target: 75 },
    water: { consumed: 1.8, target: 3.0 }
  };

  const data = nutritionData || mockData;
  const hasData = nutritionData !== undefined;

  return (
    <Card className={cn("transition-all duration-300 animate-fade-in", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Utensils className="h-4 w-4 text-green-600" />
            </div>
            <CardTitle className="text-lg">🍎 Nutrition Today</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggle}
            className="h-8 w-8 p-0"
          >
            {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {!collapsed && (
        <CardContent className="space-y-4">
          {!hasData ? (
            <div className="text-center py-8">
              <Camera size={48} className="mx-auto mb-4 opacity-20 text-green-500" />
              <p className="text-muted-foreground mb-3">
                You haven't logged meals yet today — tap above to snap your snack and stay on track 💪
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="hover:bg-green-50 hover:border-green-300"
                onClick={onLogMeal}
              >
                <Camera className="h-4 w-4 mr-2" />
                Log Meals
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Calories */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Calories</span>
                  <span>{data.calories.consumed}/{data.calories.target} kcal</span>
                </div>
                <Progress value={(data.calories.consumed / data.calories.target) * 100} className="h-2" />
              </div>
              
              {/* Macros */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="text-center">
                  <p className="font-medium text-blue-600">Protein</p>
                  <p>{data.protein.consumed}g / {data.protein.target}g</p>
                  <Progress value={(data.protein.consumed / data.protein.target) * 100} className="h-1 mt-1" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-orange-600">Carbs</p>
                  <p>{data.carbs.consumed}g / {data.carbs.target}g</p>
                  <Progress value={(data.carbs.consumed / data.carbs.target) * 100} className="h-1 mt-1" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-purple-600">Fat</p>
                  <p>{data.fat.consumed}g / {data.fat.target}g</p>
                  <Progress value={(data.fat.consumed / data.fat.target) * 100} className="h-1 mt-1" />
                </div>
              </div>
              
              {/* Water */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">💧 Water</span>
                  <span>{data.water.consumed}L / {data.water.target}L</span>
                </div>
                <Progress value={(data.water.consumed / data.water.target) * 100} className="h-2" />
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
