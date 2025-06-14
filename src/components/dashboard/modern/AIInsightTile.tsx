
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
    <Card className="bg-gradient-to-r from-indigo-100 to-violet-100 dark:from-indigo-900/50 dark:to-violet-900/50 border-indigo-200 dark:border-indigo-700 shadow-lg">
      <CardContent className="p-5">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-lg">🧠</span>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-1">
              AI Coach Insight
            </h4>
            <p className="text-indigo-700 dark:text-indigo-300 text-sm mb-3 leading-relaxed">
              "{randomInsight}"
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
