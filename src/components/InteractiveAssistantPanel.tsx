
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Zap, 
  CheckCircle,
  Info,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractiveAssistantPanelProps {
  workoutDistribution: {
    upper: number;
    lower: number;
    cardio: number;
    recovery: number;
  };
  suggestions: Array<{
    day: string;
    title: string;
    type: string;
    reason: string;
  }>;
  onOptimizeWeek: () => void;
  onApplySuggestions: (suggestions: any[]) => void;
  onAutoPlanWeek: (difficulty: string) => void;
  className?: string;
}

export function InteractiveAssistantPanel({
  workoutDistribution,
  suggestions,
  onOptimizeWeek,
  onApplySuggestions,
  onAutoPlanWeek,
  className
}: InteractiveAssistantPanelProps) {
  const [lastAppliedTip, setLastAppliedTip] = useState("Tuesday swap");

  const handleApplyTip = () => {
    // Apply the first suggestion
    if (suggestions.length > 0) {
      onApplySuggestions([suggestions[0]]);
      setLastAppliedTip(`${suggestions[0].day} ${suggestions[0].type} suggestion`);
    }
  };

  return (
    <Card className={cn("transition-all duration-300 animate-fade-in", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-purple-100 rounded-lg relative">
              <Brain className="h-4 w-4 text-purple-600" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            </div>
            <CardTitle className="text-lg">🧠 AI Workout Coach</CardTitle>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground hover:text-purple-600 cursor-pointer">
                  <Info className="h-3 w-3" />
                  <span>Last applied</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Last coach suggestion applied: {lastAppliedTip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Weekly Distribution */}
        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
          <h4 className="font-medium text-purple-700 mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            This Week's Focus
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span>Upper Body:</span>
              <Badge variant="secondary">{workoutDistribution.upper}x</Badge>
            </div>
            <div className="flex justify-between">
              <span>Lower Body:</span>
              <Badge variant="secondary">{workoutDistribution.lower}x</Badge>
            </div>
            <div className="flex justify-between">
              <span>Cardio:</span>
              <Badge variant="secondary">{workoutDistribution.cardio}x</Badge>
            </div>
            <div className="flex justify-between">
              <span>Recovery:</span>
              <Badge variant="secondary">{workoutDistribution.recovery}x</Badge>
            </div>
          </div>
        </div>

        {/* AI Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              Coach Recommendations
            </h4>
            {suggestions.slice(0, 2).map((suggestion, index) => (
              <div key={index} className="p-2 bg-yellow-50 rounded border border-yellow-200 text-xs">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-yellow-700">{suggestion.day}: {suggestion.title}</span>
                  <Badge variant="outline" className="text-xs">{suggestion.type}</Badge>
                </div>
                <p className="text-yellow-600 text-xs">{suggestion.reason}</p>
              </div>
            ))}
            
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleApplyTip}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-xs"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Apply Tip
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onOptimizeWeek}
                className="flex-1 text-xs"
              >
                <Target className="h-3 w-3 mr-1" />
                Optimize Week
              </Button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAutoPlanWeek('moderate')}
            className="flex-1 text-xs"
          >
            Auto-Plan Week
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
