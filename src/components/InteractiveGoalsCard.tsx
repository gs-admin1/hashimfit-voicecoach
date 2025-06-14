
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Target, Edit, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Goal {
  id: number;
  type: string;
  label: string;
  current: number;
  target: number;
  unit: string;
}

interface InteractiveGoalsCardProps {
  goals: Goal[];
  onEditGoal: (goalId: number, newTarget: number) => void;
  className?: string;
}

export function InteractiveGoalsCard({ 
  goals, 
  onEditGoal, 
  className 
}: InteractiveGoalsCardProps) {
  const [editingGoal, setEditingGoal] = useState<number | null>(null);
  const [newTarget, setNewTarget] = useState<string>("");

  const handleStartEdit = (goal: Goal) => {
    setEditingGoal(goal.id);
    setNewTarget(goal.target.toString());
  };

  const handleSaveEdit = (goalId: number) => {
    const target = parseInt(newTarget);
    if (!isNaN(target) && target > 0) {
      onEditGoal(goalId, target);
    }
    setEditingGoal(null);
    setNewTarget("");
  };

  const handleCancelEdit = () => {
    setEditingGoal(null);
    setNewTarget("");
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressMessage = (percentage: number) => {
    if (percentage >= 90) return "One more day to hit it! 🎯";
    if (percentage >= 75) return "You're nearly there! 💪";
    if (percentage >= 50) return "You're picking up steam 🔥";
    if (percentage >= 25) return "Great start, keep going! ⭐";
    return "Every step counts! 🌱";
  };

  const suggestedGoals = [
    { type: 'workouts', label: '3 workouts/week', target: 3, unit: 'workouts' },
    { type: 'protein', label: '120g protein', target: 120, unit: 'g' },
    { type: 'steps', label: '8,000 steps/day', target: 8000, unit: 'steps' }
  ];

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-hashim-600" />
            <CardTitle className="text-lg">Goals</CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs">
            Interactive
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {goals.length > 0 ? (
          <div className="space-y-3">
            {goals.map((goal) => {
              const percentage = Math.round((goal.current / goal.target) * 100);
              const isEditing = editingGoal === goal.id;
              
              return (
                <div key={goal.id} className="p-3 bg-gray-50 rounded-lg animate-fade-in hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{goal.label}</span>
                    {!isEditing ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStartEdit(goal)}
                        className="p-1 h-auto hover:scale-110 transition-all"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    ) : (
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSaveEdit(goal.id)}
                          className="p-1 h-auto text-green-600 hover:scale-110 transition-all"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCancelEdit}
                          className="p-1 h-auto text-red-600 hover:scale-110 transition-all"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">
                      Current: {goal.current} {goal.unit}
                    </span>
                    {!isEditing ? (
                      <span className="text-xs text-muted-foreground">
                        Target: {goal.target} {goal.unit}
                      </span>
                    ) : (
                      <div className="flex items-center space-x-1">
                        <span className="text-xs">Target:</span>
                        <Input
                          type="number"
                          value={newTarget}
                          onChange={(e) => setNewTarget(e.target.value)}
                          className="w-16 h-6 text-xs p-1"
                        />
                        <span className="text-xs">{goal.unit}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <Progress value={Math.min(percentage, 100)} className="h-2" />
                    <div className="flex justify-between items-center">
                      <span className={cn("text-xs font-medium", getProgressColor(percentage))}>
                        {percentage}% complete
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {getProgressMessage(percentage)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center py-4">
              <Target size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium mb-2">No goals set yet</p>
              <p className="text-xs text-muted-foreground mb-4">
                Try starting with these recommended goals:
              </p>
            </div>
            
            <div className="space-y-2">
              {suggestedGoals.map((suggestion, index) => (
                <div key={index} className="flex items-center justify-between p-2 border border-dashed border-gray-300 rounded-lg hover:border-hashim-300 hover:bg-hashim-50 transition-all">
                  <span className="text-sm">{suggestion.label}</span>
                  <Button size="sm" variant="outline" className="text-xs hover:scale-105 transition-all">
                    Add Goal
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
