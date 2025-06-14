
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AICoachBannerProps {
  workoutType?: string;
  difficulty?: number;
  targetMuscles?: string[];
  className?: string;
}

export function AICoachBanner({ 
  workoutType = "Full Body", 
  difficulty = 3,
  targetMuscles = [],
  className 
}: AICoachBannerProps) {
  // Generate contextual tips based on workout
  const getContextualTip = () => {
    const tips = [
      {
        condition: workoutType.toLowerCase().includes('pull') || targetMuscles.some(m => m.toLowerCase().includes('back')),
        tip: "Focus on squeezing your shoulder blades together on pulling movements for better back activation 💪"
      },
      {
        condition: workoutType.toLowerCase().includes('push') || targetMuscles.some(m => m.toLowerCase().includes('chest')),
        tip: "Control the descent on push movements — slow negatives build more strength 🔥"
      },
      {
        condition: workoutType.toLowerCase().includes('leg') || targetMuscles.some(m => m.toLowerCase().includes('leg')),
        tip: "Try holding the bottom position of squats for 2 seconds for more time under tension ⚡"
      },
      {
        condition: workoutType.toLowerCase().includes('core') || targetMuscles.some(m => m.toLowerCase().includes('core')),
        tip: "🔥 Tip: Pair core moves with steady breathing for better stability and control"
      },
      {
        condition: difficulty >= 7,
        tip: "This is an advanced session — focus on perfect form over speed. You've got this! 💯"
      },
      {
        condition: difficulty <= 3,
        tip: "Perfect for building consistency — focus on the mind-muscle connection 🧠"
      }
    ];

    const matchingTip = tips.find(tip => tip.condition);
    return matchingTip?.tip || "Stay hydrated and listen to your body. Every rep counts! 💪";
  };

  return (
    <Card className={cn(
      "bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 animate-fade-in",
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 p-2 bg-purple-100 rounded-lg">
            <Brain className="h-4 w-4 text-purple-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-purple-800">🧠 AI Coach Tip</h3>
              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                Today's Focus
              </Badge>
            </div>
            <p className="text-sm text-purple-700 leading-relaxed">
              {getContextualTip()}
            </p>
          </div>
          <div className="flex-shrink-0">
            <Lightbulb className="h-4 w-4 text-purple-500 animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
