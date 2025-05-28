
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Brain, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AICoachInsightCardProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

export function AICoachInsightCard({ 
  isCollapsed = false, 
  onToggleCollapse,
  className 
}: AICoachInsightCardProps) {
  const [localCollapsed, setLocalCollapsed] = useState(isCollapsed);
  
  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setLocalCollapsed(!localCollapsed);
    }
  };
  
  const collapsed = onToggleCollapse ? isCollapsed : localCollapsed;
  
  // Mock AI insights
  const insights = [
    {
      id: 1,
      type: "encouraging",
      title: "Great Progress!",
      message: "You've hit your protein target 5 days in a row. Keep up the excellent work!",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      id: 2,
      type: "suggestion",
      title: "Optimization Tip",
      message: "Try adding 20g more carbs pre-workout to boost your energy levels.",
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    }
  ];

  return (
    <Card className={cn("transition-all duration-300", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="h-4 w-4 text-purple-600" />
            </div>
            <CardTitle className="text-lg">AI Coach Insights</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggle}
            className="h-8 w-8 p-0"
          >
            {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {!collapsed && (
        <CardContent className="space-y-3">
          {insights.map((insight) => (
            <div key={insight.id} className={`p-3 rounded-lg border ${insight.bgColor}`}>
              <div className="flex items-start space-x-3">
                <div className={`p-1 rounded-full ${insight.color}`}>
                  <insight.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-sm">{insight.title}</h4>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${insight.type === 'encouraging' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}
                    >
                      {insight.type === 'encouraging' ? 'Encouraging' : 'Tip'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {insight.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          <div className="pt-2">
            <Button variant="outline" size="sm" className="w-full">
              Chat with AI Coach
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
