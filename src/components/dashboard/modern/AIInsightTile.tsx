
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIInsightTileProps {
  insight: {
    message: string;
    type: 'positive' | 'suggestion' | 'warning';
    actionText?: string;
  };
  onAction: () => void;
  className?: string;
}

export function AIInsightTile({ insight, onAction, className }: AIInsightTileProps) {
  const getInsightStyle = () => {
    switch (insight.type) {
      case 'positive': return 'from-green-50 to-emerald-50 border-green-200';
      case 'warning': return 'from-orange-50 to-yellow-50 border-orange-200';
      default: return 'from-blue-50 to-purple-50 border-blue-200';
    }
  };

  const getIconColor = () => {
    switch (insight.type) {
      case 'positive': return 'text-green-600';
      case 'warning': return 'text-orange-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <Card className={cn(`border-2 bg-gradient-to-br ${getInsightStyle()}`, className)}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-full bg-white/50 ${getIconColor()} relative`}>
            <Brain className="h-5 w-5" />
            <Sparkles className="h-2 w-2 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm font-semibold text-gray-600">Your AI Coach</span>
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            </div>
            <blockquote className="text-gray-800 font-medium leading-relaxed mb-3">
              "{insight.message}"
            </blockquote>
            {insight.actionText && (
              <Button 
                onClick={onAction}
                variant="outline"
                size="sm"
                className="text-xs hover:bg-white/50"
              >
                {insight.actionText}
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
