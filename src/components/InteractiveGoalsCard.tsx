
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Target, Edit, Plus, Check, X } from "lucide-react";
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
  const [editValue, setEditValue] = useState("");

  const handleEditStart = (goal: Goal) => {
    setEditingGoal(goal.id);
    setEditValue(goal.target.toString());
  };

  const handleEditSave = (goalId: number) => {
    const newTarget = parseInt(editValue);
    if (!isNaN(newTarget) && newTarget > 0) {
      onEditGoal(goalId, newTarget);
    }
    setEditingGoal(null);
    setEditValue("");
  };

  const handleEditCancel = () => {
    setEditingGoal(null);
    setEditValue("");
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
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
          <Button variant="ghost" size="sm" className="text-hashim-600">
            <Plus size={16} className="mr-1" />
            Add Goal
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {goals.length > 0 ? (
          <>
            {/* Current Goals Panel */}
            <div className="p-3 bg-hashim-50 rounded-lg border border-hashim-200">
              <p className="text-sm font-medium text-hashim-800 mb-2">Current Goals:</p>
              <div className="text-xs text-hashim-600 space-y-1">
                {goals.map((goal) => (
                  <div key={goal.id} className="flex justify-between">
                    <span>{goal.label}:</span>
                    <span className="font-medium">{goal.target}{goal.unit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Goal Tracking */}
            <div className="space-y-4">
              {goals.map((goal) => {
                const percentage = Math.min((goal.current / goal.target) * 100, 100);
                const isEditing = editingGoal === goal.id;
                
                return (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{goal.label}</span>
                          <div className="flex items-center space-x-2">
                            {isEditing ? (
                              <>
                                <Input
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="w-16 h-6 text-xs"
                                  type="number"
                                />
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={() => handleEditSave(goal.id)}
                                >
                                  <Check size={12} className="text-green-600" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={handleEditCancel}
                                >
                                  <X size={12} className="text-red-600" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <span className={cn("text-sm font-bold", getProgressColor(percentage))}>
                                  {goal.current}/{goal.target} {goal.unit}
                                </span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={() => handleEditStart(goal)}
                                >
                                  <Edit size={12} className="text-muted-foreground" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                        <Progress value={percentage} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>{Math.round(percentage)}% complete</span>
                          <span>
                            {percentage >= 100 ? '🎉 Goal reached!' : 
                             percentage >= 80 ? '🔥 Almost there!' : 
                             percentage >= 50 ? '💪 Keep going!' : '🚀 Getting started!'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <Target size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-sm font-medium mb-4">Try starting with:</p>
            <div className="space-y-2 text-left">
              {suggestedGoals.map((goal, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{goal.label}</span>
                  <Button size="sm" variant="outline" className="h-6 text-xs">
                    Add
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
