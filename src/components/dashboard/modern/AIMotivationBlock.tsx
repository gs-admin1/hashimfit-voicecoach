
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Sparkles } from "lucide-react";

interface AIMotivationBlockProps {
  userName: string;
  streakDays: number;
  weeklyProgress: number;
  weeklyGoal: number;
  onAskCoach: () => void;
}

export function AIMotivationBlock({ userName, streakDays, weeklyProgress, weeklyGoal, onAskCoach }: AIMotivationBlockProps) {
  const getMotivationalMessage = () => {
    const remainingWorkouts = weeklyGoal - weeklyProgress;
    
    if (weeklyProgress >= weeklyGoal) {
      return `🎉 Amazing work, ${userName}! You've crushed this week's goal. Ready for an extra challenge?`;
    } else if (remainingWorkouts === 1) {
      return `💪 You're so close, ${userName}! Just 1 more workout to hit your weekly goal.`;
    } else if (streakDays >= 5) {
      return `🔥 ${streakDays}-day streak is incredible! You're building unstoppable momentum.`;
    } else {
      return `⚡ ${remainingWorkouts} workouts left to reach your goal. You've got this, ${userName}!`;
    }
  };

  const getCoachPersonality = () => {
    // This could be customizable based on user preferences
    return "motivational"; // Options: motivational, drill-sergeant, gentle, etc.
  };

  return (
    <Card className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 border-indigo-200 dark:border-indigo-700 shadow-lg overflow-hidden">
      <CardContent className="p-5 relative">
        {/* Background sparkles */}
        <div className="absolute top-2 right-2">
          <Sparkles className="h-6 w-6 text-indigo-400 animate-pulse" />
        </div>
        
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-lg">🧠</span>
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-indigo-800 dark:text-indigo-200 mb-1 text-lg">
              Your AI Coach
            </h4>
            <p className="text-indigo-700 dark:text-indigo-300 mb-4 leading-relaxed">
              "{getMotivationalMessage()}"
            </p>
            <Button 
              variant="outline"
              size="sm"
              onClick={onAskCoach}
              className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-600 dark:text-indigo-300 dark:hover:bg-indigo-900/30"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Ask Coach
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
