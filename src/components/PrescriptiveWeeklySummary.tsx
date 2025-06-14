
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  TrendingUp,
  Target,
  AlertTriangle,
  CheckCircle,
  Edit3,
  Trophy,
  Flame
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WeeklyGoal {
  type: 'workouts' | 'protein' | 'calories';
  label: string;
  current: number;
  target: number;
  unit?: string;
}

interface PrescriptiveWeeklySummaryProps {
  coachMessage: string;
  weeklyGoals: WeeklyGoal[];
  mostConsistentHabit: string;
  calorieBalance: number;
  onUpdateGoal: (type: string, newTarget: number) => void;
  className?: string;
}

export function PrescriptiveWeeklySummary({
  coachMessage,
  weeklyGoals,
  mostConsistentHabit,
  calorieBalance,
  onUpdateGoal,
  className
}: PrescriptiveWeeklySummaryProps) {
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');

  const getComplianceColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (percentage >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getComplianceIcon = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 80) return <CheckCircle size={16} />;
    if (percentage >= 60) return <AlertTriangle size={16} />;
    return <AlertTriangle size={16} />;
  };

  const handleStartEdit = (goal: WeeklyGoal) => {
    setEditingGoal(goal.type);
    setTempValue(goal.target.toString());
  };

  const handleSaveEdit = (type: string) => {
    const newTarget = parseInt(tempValue);
    if (!isNaN(newTarget) && newTarget > 0) {
      onUpdateGoal(type, newTarget);
    }
    setEditingGoal(null);
    setTempValue('');
  };

  const formatCalorieBalance = (balance: number) => {
    if (balance > 0) return `+${balance} surplus`;
    if (balance < 0) return `${Math.abs(balance)} deficit`;
    return "balanced";
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp size={20} />
          Weekly Summary
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Coach Message */}
        <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
          <p className="text-purple-800 font-medium text-sm">{coachMessage}</p>
        </div>

        {/* Weekly Goals */}
        <div className="space-y-3">
          <h3 className="font-medium flex items-center gap-2">
            <Target size={16} />
            This Week's Goals
          </h3>
          
          <div className="space-y-2">
            {weeklyGoals.map((goal) => (
              <div
                key={goal.type}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border",
                  getComplianceColor(goal.current, goal.target)
                )}
              >
                <div className="flex items-center gap-2">
                  {getComplianceIcon(goal.current, goal.target)}
                  <span className="font-medium text-sm">{goal.label}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {editingGoal === goal.type ? (
                    <div className="flex items-center gap-1">
                      <span className="text-sm">{goal.current}/</span>
                      <Input
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        className="w-16 h-6 text-xs"
                        onBlur={() => handleSaveEdit(goal.type)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(goal.type);
                          if (e.key === 'Escape') setEditingGoal(null);
                        }}
                        autoFocus
                      />
                      <span className="text-sm">{goal.unit || ''}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">
                        {goal.current}/{goal.target} {goal.unit || ''}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleStartEdit(goal)}
                      >
                        <Edit3 size={10} />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Highlights */}
        <div className="space-y-3">
          <h3 className="font-medium">This Week's Highlights</h3>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-200">
              <Trophy size={14} className="text-green-600" />
              <span className="text-sm text-green-700">
                Most consistent: <strong>{mostConsistentHabit}</strong>
              </span>
            </div>
            
            {calorieBalance !== 0 && (
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded border border-blue-200">
                <Flame size={14} className="text-blue-600" />
                <span className="text-sm text-blue-700">
                  Estimated weekly {formatCalorieBalance(calorieBalance)} calories
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Goal Suggestions */}
        <div className="pt-2 border-t">
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant="outline" 
              className="cursor-pointer hover:bg-hashim-50"
              onClick={() => onUpdateGoal('workouts', 4)}
            >
              🎯 4 workouts/week
            </Badge>
            <Badge 
              variant="outline" 
              className="cursor-pointer hover:bg-hashim-50"
              onClick={() => onUpdateGoal('protein', 120)}
            >
              🥩 120g protein/day
            </Badge>
            <Badge 
              variant="outline" 
              className="cursor-pointer hover:bg-hashim-50"
              onClick={() => onUpdateGoal('calories', 2000)}
            >
              🔥 2000 cal/day
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
