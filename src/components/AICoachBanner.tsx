
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIInsight {
  type: 'suggestion' | 'warning' | 'achievement';
  title: string;
  message: string;
  action?: string;
}

interface AICoachBannerProps {
  insights: AIInsight[];
  onOptimizeWeek: () => void;
  onDismissInsight: (index: number) => void;
  className?: string;
}

export function AICoachBanner({ 
  insights, 
  onOptimizeWeek, 
  onDismissInsight, 
  className 
}: AICoachBannerProps) {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'suggestion': return <Sparkles size={16} className="text-blue-500" />;
      case 'warning': return <AlertCircle size={16} className="text-orange-500" />;
      case 'achievement': return <CheckCircle size={16} className="text-green-500" />;
      default: return <TrendingUp size={16} className="text-purple-500" />;
    }
  };
  
  const getInsightBadgeColor = (type: string) => {
    switch (type) {
      case 'suggestion': return 'bg-blue-100 text-blue-700';
      case 'warning': return 'bg-orange-100 text-orange-700';
      case 'achievement': return 'bg-green-100 text-green-700';
      default: return 'bg-purple-100 text-purple-700';
    }
  };
  
  return (
    <Card className={cn("bg-gradient-to-r from-hashim-50 to-purple-50 border-hashim-200", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-hashim-600 rounded-full flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-hashim-900">AI Coach</h3>
              <p className="text-sm text-hashim-600">Your personalized fitness assistant</p>
            </div>
          </div>
          
          <Button
            onClick={onOptimizeWeek}
            className="bg-hashim-600 hover:bg-hashim-700 text-white"
            size="sm"
          >
            <Sparkles size={14} className="mr-1" />
            Optimize My Week
          </Button>
        </div>
        
        {insights.length > 0 && (
          <div className="space-y-2">
            {insights.slice(0, 2).map((insight, index) => (
              <div 
                key={index}
                className="flex items-start space-x-3 p-3 bg-white/60 rounded-lg border border-white/50"
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getInsightIcon(insight.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge 
                      variant="secondary" 
                      className={cn("text-xs", getInsightBadgeColor(insight.type))}
                    >
                      {insight.title}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700">{insight.message}</p>
                  {insight.action && (
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto text-hashim-600 text-xs mt-1"
                    >
                      {insight.action}
                    </Button>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDismissInsight(index)}
                  className="h-auto p-1 text-gray-400 hover:text-gray-600"
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
