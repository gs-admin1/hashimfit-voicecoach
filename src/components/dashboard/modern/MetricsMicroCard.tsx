
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Weight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricsMicroCardProps {
  weight: {
    current: number;
    change: number;
    trend: 'up' | 'down' | 'steady';
  };
  bodyFat: {
    current: number;
    change: number;
    trend: 'up' | 'down' | 'steady';
  };
  className?: string;
}

export function MetricsMicroCard({ weight, bodyFat, className }: MetricsMicroCardProps) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-red-500" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-green-500" />;
      default: return <div className="w-3 h-3 rounded-full bg-gray-400" />;
    }
  };

  const getTrendColor = (trend: string, isWeight: boolean = true) => {
    if (trend === 'steady') return 'text-gray-600';
    
    // For weight: down is good, up might be bad (unless gaining muscle)
    // For body fat: down is always good
    if (isWeight) {
      return trend === 'down' ? 'text-green-600' : 'text-orange-600';
    } else {
      return trend === 'down' ? 'text-green-600' : 'text-red-600';
    }
  };

  return (
    <Card className={cn("border-0 shadow-lg bg-gradient-to-r from-gray-50 to-blue-50", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center space-x-2">
          <Weight className="h-5 w-5 text-blue-600" />
          <span>Body Metrics</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Weight */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Weight</p>
            <p className="text-2xl font-bold">{weight.current}kg</p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-1">
              {getTrendIcon(weight.trend)}
              <span className={cn("text-sm font-medium", getTrendColor(weight.trend, true))}>
                {weight.change > 0 ? '+' : ''}{weight.change}kg
              </span>
            </div>
            <p className="text-xs text-gray-500">this week</p>
          </div>
        </div>

        {/* Body Fat */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div>
            <p className="text-sm text-gray-600">Body Fat</p>
            <p className="text-2xl font-bold">{bodyFat.current}%</p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-1">
              {getTrendIcon(bodyFat.trend)}
              <span className={cn("text-sm font-medium", getTrendColor(bodyFat.trend, false))}>
                {bodyFat.change > 0 ? '+' : ''}{bodyFat.change}%
              </span>
            </div>
            <p className="text-xs text-gray-500">this week</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
