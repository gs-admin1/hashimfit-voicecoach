
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, MessageCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleCoachInsightProps {
  workout: {
    difficulty: number;
    category: string;
    targetMuscles?: string[];
  };
  className?: string;
}

export function CollapsibleCoachInsight({ workout, className }: CollapsibleCoachInsightProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getCoachMessage = () => {
    if (workout.difficulty > 6) {
      return "High intensity session ahead! Focus on proper form and rest between sets. Stay hydrated! 💪";
    }
    return "Perfect training intensity for steady progress. Maintain good form and challenge yourself progressively. You've got this! 🔥";
  };

  return (
    <Card className={cn("transition-all duration-300", className)}>
      <CardContent className="p-0">
        {/* Collapsed Header */}
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 flex items-center justify-between hover:bg-indigo-50/50 rounded-lg"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center relative">
              <MessageCircle className="h-5 w-5 text-white" />
              <Sparkles className="h-3 w-3 text-indigo-300 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-indigo-800 text-sm">
                🧠 AI Coach Insight
              </h4>
              {!isExpanded && (
                <p className="text-xs text-indigo-600">Tap to expand</p>
              )}
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-indigo-600" />
          ) : (
            <ChevronDown className="h-4 w-4 text-indigo-600" />
          )}
        </Button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="px-4 pb-4 animate-accordion-down">
            <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200/50 rounded-lg p-4">
              <p className="text-indigo-700 text-sm leading-relaxed">
                {getCoachMessage()}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
