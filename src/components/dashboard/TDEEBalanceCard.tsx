
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface TDEEData {
  tdee: number;
  intake: number;
  balance: number;
  goal: "fat_loss" | "muscle_gain" | "maintenance";
  targetDeficit: number;
}

interface TDEEBalanceCardProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
  tdeeData?: TDEEData;
  onAdjustGoals?: () => void;
}

export function TDEEBalanceCard({ 
  isCollapsed = false, 
  onToggleCollapse,
  className,
  tdeeData,
  onAdjustGoals
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
  
  if (!tdeeData) {
    return (
      <Card className={cn("transition-all duration-300", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Activity className="h-4 w-4 text-orange-600" />
              </div>
              <CardTitle className="text-lg">Energy Balance</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Activity size={48} className="mx-auto mb-4 opacity-20" />
            <p>Set up your nutrition goals to track energy balance</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={onAdjustGoals}>
              Set Goals
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const isOnTrack = Math.abs(tdeeData.balance - tdeeData.targetDeficit) <= 200;
  const balanceColor = tdeeData.balance < 0 ? "text-red-600" : "text-green-600";
  const balanceIcon = tdeeData.balance < 0 ? TrendingDown : TrendingUp;
  const BalanceIcon = balanceIcon;

  return (
    <Card className={cn("transition-all duration-300", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Activity className="h-4 w-4 text-orange-600" />
            </div>
            <CardTitle className="text-lg">Energy Balance</CardTitle>
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
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-muted-foreground">TDEE</p>
              <p className="text-xl font-bold text-blue-600">{tdeeData.tdee}</p>
              <p className="text-xs text-muted-foreground">calories/day</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Intake</p>
              <p className="text-xl font-bold text-green-600">{tdeeData.intake}</p>
              <p className="text-xs text-muted-foreground">calories today</p>
            </div>
          </div>
          
          <div className={`text-center p-4 rounded-lg border-2 ${isOnTrack ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
            <div className="flex items-center justify-center space-x-2 mb-2">
              <BalanceIcon className={`h-5 w-5 ${balanceColor}`} />
              <p className={`text-2xl font-bold ${balanceColor}`}>
                {tdeeData.balance > 0 ? '+' : ''}{tdeeData.balance}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              {tdeeData.balance < 0 ? 'Calorie Deficit' : 'Calorie Surplus'}
            </p>
            <p className={`text-xs mt-1 ${isOnTrack ? 'text-green-600' : 'text-amber-600'}`}>
              {isOnTrack ? '✓ On track with your goal' : `Target: ${tdeeData.targetDeficit} cal/day`}
            </p>
          </div>
          
          <div className="pt-2 text-center">
            <Button variant="outline" size="sm" onClick={onAdjustGoals}>
              Adjust Goals
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
