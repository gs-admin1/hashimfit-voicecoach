
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronDown, ChevronUp, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";

interface NutritionProgressCardProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

export function NutritionProgressCard({ 
  isCollapsed = false, 
  onToggleCollapse,
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
  
  // Mock nutrition data
  const nutritionData = {
    calories: { current: 1650, target: 2200, percentage: 75 },
    protein: { current: 120, target: 165, percentage: 73 },
    carbs: { current: 180, target: 250, percentage: 72 },
    fat: { current: 65, target: 85, percentage: 76 }
  };

  const MacroBar = ({ label, current, target, percentage, color }: any) => (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{current}g / {target}g</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );

  return (
    <Card className={cn("transition-all duration-300", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Utensils className="h-4 w-4 text-green-600" />
            </div>
            <CardTitle className="text-lg">Nutrition Today</CardTitle>
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
          {/* Calories with circular progress */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
            <div>
              <p className="text-2xl font-bold">{nutritionData.calories.current}</p>
              <p className="text-sm text-muted-foreground">of {nutritionData.calories.target} calories</p>
            </div>
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="2"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeDasharray={`${nutritionData.calories.percentage}, 100`}
                  className="transition-all duration-300"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold">{nutritionData.calories.percentage}%</span>
              </div>
            </div>
          </div>
          
          {/* Macros */}
          <div className="space-y-3">
            <MacroBar 
              label="Protein" 
              current={nutritionData.protein.current}
              target={nutritionData.protein.target}
              percentage={nutritionData.protein.percentage}
              color="bg-green-500"
            />
            <MacroBar 
              label="Carbs" 
              current={nutritionData.carbs.current}
              target={nutritionData.carbs.target}
              percentage={nutritionData.carbs.percentage}
              color="bg-blue-500"
            />
            <MacroBar 
              label="Fat" 
              current={nutritionData.fat.current}
              target={nutritionData.fat.target}
              percentage={nutritionData.fat.percentage}
              color="bg-amber-500"
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
}
