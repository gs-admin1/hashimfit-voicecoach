
import { useState } from "react";
import { AnimatedCard } from "@/components/ui-components";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Edit, Clock, AlertCircle } from "lucide-react";

interface EnhancedAICoachCardProps {
  lastReassessDate?: string;
  isOverdue?: boolean;
  onReassess?: () => void;
}

export function EnhancedAICoachCard({ 
  lastReassessDate = "2 weeks ago",
  isOverdue = false,
  onReassess
}: EnhancedAICoachCardProps) {
  const [isReassessing, setIsReassessing] = useState(false);

  const handleReassess = async () => {
    setIsReassessing(true);
    // Simulate reassessment process
    setTimeout(() => {
      setIsReassessing(false);
      onReassess?.();
    }, 2000);
  };

  return (
    <AnimatedCard className="mb-6" delay={450}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Bot size={20} className="text-hashim-600 mr-3" />
          <div>
            <h3 className="font-semibold">AI Profile Assistant</h3>
            <p className="text-sm text-muted-foreground">
              Your coach uses your plan, preferences, and progress to adjust your journey weekly.
            </p>
          </div>
        </div>
        {isOverdue && (
          <div className="flex items-center">
            <AlertCircle size={16} className="text-orange-500 animate-pulse" />
          </div>
        )}
      </div>

      <div className="bg-hashim-50 dark:bg-hashim-900/20 rounded-lg p-4 mb-4">
        <div className="flex items-start space-x-2">
          <div className="flex-shrink-0 w-2 h-2 bg-hashim-500 rounded-full mt-2"></div>
          <p className="text-sm text-hashim-700 dark:text-hashim-300 font-medium">
            Welcome back! Focus on consistency this week and consider increasing your protein intake by 10g daily.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Clock size={14} />
          <span>Last reassessed: {lastReassessDate}</span>
          {isOverdue && (
            <Badge variant="secondary" className="text-orange-600 bg-orange-100">
              Overdue
            </Badge>
          )}
        </div>
        
        <Button 
          variant="outline"
          size="sm"
          onClick={handleReassess}
          disabled={isReassessing}
          className="hashim-button-outline"
        >
          {isReassessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-hashim-600 mr-2"></div>
              Analyzing...
            </>
          ) : (
            <>
              <Edit size={16} className="mr-2" />
              Reassess
            </>
          )}
        </Button>
      </div>
    </AnimatedCard>
  );
}
