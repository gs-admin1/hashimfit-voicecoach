
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface TDEEData {
  caloriesConsumed: number;
  caloriesBurned: number;
  tdee: number;
  bmr: number;
  exerciseCalories: number;
}

interface TDEEBalanceCardProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  tdeeData?: TDEEData;
  className?: string;
}

export function TDEEBalanceCard({ 
  isCollapsed = false, 
  onToggleCollapse,
  tdeeData,
  className
}: TDEEBalanceCardProps) {
  const [localCollapsed, setLocalCollapsed] = useState(isCollapsed);
  
  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setLocalCollapsed(!localCollapsed);
    }
  };
  
  const collapsed = onToggleCollapse ? isCollapsed : localCollapsed;

  // Mock data when no TDEE data is provided
  const mockData: TDEEData = {
    caloriesConsumed: 1250,
    caloriesBurned: 1850,
    tdee: 2200,
    bmr: 1600,
    exerciseCalories: 350
  };

  const data = tdeeData || mockData;
  const balance = data.caloriesConsumed - data.caloriesBurned;
  const isDeficit = balance < 0;
  const isSurplus = balance > 0;

  return (
    <Card className={cn("transition-all duration-300 animate-fade-in", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              {isDeficit ? <TrendingDown className="h-4 w-4 text-blue-600" /> : 
               isSurplus ? <TrendingUp className="h-4 w-4 text-blue-600" /> : 
               <Minus className="h-4 w-4 text-blue-600" />}
            </div>
            <div className="flex items-center space-x-1">
              <CardTitle className="text-lg">⚡ Energy Balance</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Compare calories consumed vs burned</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
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
          {/* Balance Summary */}
          <div className={`p-3 rounded-lg ${
            isDeficit ? 'bg-green-50 border border-green-200' : 
            isSurplus ? 'bg-orange-50 border border-orange-200' : 
            'bg-gray-50 border border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-lg font-bold ${
                  isDeficit ? 'text-green-600' : 
                  isSurplus ? 'text-orange-600' : 
                  'text-gray-600'
                }`}>
                  {isDeficit ? `-${Math.abs(balance)}` : isSurplus ? `+${balance}` : '0'} cal
                </p>
                <p className="text-sm text-muted-foreground">
                  {isDeficit ? 'Calorie deficit' : isSurplus ? 'Calorie surplus' : 'Balanced'}
                </p>
              </div>
              <div className="text-2xl">
                {isDeficit ? '📉' : isSurplus ? '📈' : '⚖️'}
              </div>
            </div>
          </div>
          
          {/* Breakdown */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Consumed</span>
              <span className="text-sm">{data.caloriesConsumed} cal</span>
            </div>
            <Progress value={(data.caloriesConsumed / data.tdee) * 100} className="h-2" />
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Burned</span>
              <span className="text-sm">{data.caloriesBurned} cal</span>
            </div>
            <Progress value={(data.caloriesBurned / data.tdee) * 100} className="h-2" />
            
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>BMR (Base Metabolic Rate)</span>
                <span>{data.bmr} cal</span>
              </div>
              <div className="flex justify-between">
                <span>Exercise</span>
                <span>{data.exerciseCalories} cal</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>TDEE (Total Daily Energy)</span>
                <span>{data.tdee} cal</span>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
