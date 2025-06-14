
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  ChevronDown, 
  ChevronUp, 
  Target, 
  TrendingUp,
  Calendar,
  CheckCircle,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkoutDistribution {
  upper: number;
  lower: number;
  cardio: number;
  recovery: number;
}

interface SuggestedWorkout {
  day: string;
  title: string;
  type: string;
  reason: string;
}

interface InteractiveAssistantPanelProps {
  workoutDistribution: WorkoutDistribution;
  suggestions: SuggestedWorkout[];
  onOptimizeWeek: () => void;
  onApplySuggestions: (suggestions: SuggestedWorkout[]) => void;
  className?: string;
}

export function InteractiveAssistantPanel({
  workoutDistribution,
  suggestions,
  onOptimizeWeek,
  onApplySuggestions,
  className
}: InteractiveAssistantPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const getDominantWorkoutType = () => {
    const total = Object.values(workoutDistribution).reduce((sum, val) => sum + val, 0);
    if (total === 0) return "balanced";
    
    const maxType = Object.entries(workoutDistribution).reduce((max, [key, val]) => 
      val > max.value ? { type: key, value: val } : max
    , { type: "upper", value: 0 });
    
    return maxType.type;
  };

  const getPersonalizedMessage = () => {
    const dominant = getDominantWorkoutType();
    const messages = {
      upper: "You're focused on upper body. Want to balance it out with lower + recovery?",
      lower: "Great lower body focus! Consider adding some upper body work.",
      cardio: "Loving the cardio energy! Don't forget strength training.",
      recovery: "Recovery is important! Ready to add some intensity?",
      balanced: "Perfect balance this week! Let's keep the momentum going."
    };
    return messages[dominant as keyof typeof messages] || messages.balanced;
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    await onOptimizeWeek();
    setTimeout(() => {
      setIsOptimizing(false);
      setShowSuggestions(true);
    }, 2000);
  };

  const totalWorkouts = Object.values(workoutDistribution).reduce((sum, val) => sum + val, 0);

  return (
    <Card className={cn("border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 rounded-full">
              <Brain size={20} className="text-purple-600" />
            </div>
            <CardTitle className="text-lg text-purple-800">AI Workout Coach</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
        </div>
        
        <p className="text-purple-700 text-sm">{getPersonalizedMessage()}</p>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Workout Distribution Bar */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Workout Balance</span>
            <span>{totalWorkouts} sessions this week</span>
          </div>
          <div className="grid grid-cols-4 gap-1 h-2 rounded-full overflow-hidden bg-gray-200">
            <div 
              className="bg-red-400 transition-all"
              style={{ width: `${totalWorkouts > 0 ? (workoutDistribution.upper / totalWorkouts) * 100 : 0}%` }}
            />
            <div 
              className="bg-blue-400 transition-all"
              style={{ width: `${totalWorkouts > 0 ? (workoutDistribution.lower / totalWorkouts) * 100 : 0}%` }}
            />
            <div 
              className="bg-green-400 transition-all"
              style={{ width: `${totalWorkouts > 0 ? (workoutDistribution.cardio / totalWorkouts) * 100 : 0}%` }}
            />
            <div 
              className="bg-purple-400 transition-all"
              style={{ width: `${totalWorkouts > 0 ? (workoutDistribution.recovery / totalWorkouts) * 100 : 0}%` }}
            />
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-red-600">Upper</span>
            <span className="text-blue-600">Lower</span>
            <span className="text-green-600">Cardio</span>
            <span className="text-purple-600">Recovery</span>
          </div>
        </div>

        {isExpanded && (
          <div className="space-y-4 animate-fade-in">
            {!showSuggestions ? (
              <Button
                onClick={handleOptimize}
                disabled={isOptimizing}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isOptimizing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Analyzing Your Week...
                  </>
                ) : (
                  <>
                    <Target size={16} className="mr-2" />
                    Optimize My Week
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-3 animate-fade-in">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={16} className="text-green-600" />
                  <span className="font-medium text-green-700">Suggestions Ready!</span>
                </div>
                
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div>
                      <p className="font-medium">{suggestion.day}: {suggestion.title}</p>
                      <p className="text-xs text-muted-foreground">{suggestion.reason}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {suggestion.type}
                    </Badge>
                  </div>
                ))}
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => onApplySuggestions(suggestions)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Apply Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowSuggestions(false)}
                    className="flex-1"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
