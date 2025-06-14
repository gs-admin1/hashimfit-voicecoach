
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface AIInsightTileProps {
  onAskCoach: () => void;
}

export function AIInsightTile({ onAskCoach }: AIInsightTileProps) {
  const insights = [
    "Your workout consistency is amazing! Try adding 15g more protein to maximize recovery.",
    "You've been crushing your cardio! Consider adding some strength training for balance.",
    "Great job staying hydrated! Your energy levels should be improving soon.",
    "Your progress is steady. Remember, small wins lead to big transformations!",
  ];

  const randomInsight = insights[Math.floor(Math.random() * insights.length)];

  return (
    <Card className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 border-purple-200 dark:border-purple-700 shadow-lg">
      <CardContent className="p-5">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-lg">🧠</span>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-1">
              AI Coach Insight
            </h4>
            <p className="text-purple-700 dark:text-purple-300 text-sm mb-3 leading-relaxed">
              "{randomInsight}"
            </p>
            <Button 
              variant="outline"
              size="sm"
              onClick={onAskCoach}
              className="border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-300 dark:hover:bg-purple-900/30"
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
