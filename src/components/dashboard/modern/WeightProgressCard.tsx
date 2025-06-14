
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingDown, TrendingUp, Weight } from "lucide-react";
import { ProgressChart } from "@/components/ProgressChart";

interface WeightProgressCardProps {
  currentWeight?: number;
  startWeight?: number;
  weightData: { date: string; value: number }[];
  onAddWeight: () => void;
}

export function WeightProgressCard({ 
  currentWeight, 
  startWeight, 
  weightData, 
  onAddWeight 
}: WeightProgressCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const hasWeightData = weightData.length > 0;
  const weightChange = currentWeight && startWeight ? currentWeight - startWeight : 0;
  const isImproving = weightChange < 0; // Assuming weight loss is the goal
  
  if (!hasWeightData) {
    return (
      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-white/40 dark:border-slate-700/40 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
            📉 Weight Trend
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-8">
            <Weight size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-sm font-medium mb-2">No weight logged yet</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Tap to add your first weight entry!
            </p>
            <Button onClick={onAddWeight} className="w-full hover:scale-105 transition-all">
              <Weight className="h-4 w-4 mr-2" />
              Log Your Weight
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-white/40 dark:border-slate-700/40 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-slate-800 dark:text-white flex items-center justify-between">
          📉 Weight Trend
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
        </CardTitle>
        {weightChange !== 0 && (
          <div className="flex items-center space-x-1 text-sm">
            {isImproving ? (
              <TrendingDown className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingUp className="h-4 w-4 text-orange-500" />
            )}
            <span className={`font-medium ${isImproving ? 'text-green-600' : 'text-orange-600'}`}>
              {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)}kg since start
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className={`transition-all duration-300 ${isExpanded ? 'h-48' : 'h-24'} overflow-hidden`}>
          <ProgressChart
            data={weightData}
            singleMetric="weight"
          />
        </div>
        <div className="mt-3 text-center">
          <p className={`text-sm font-medium ${isImproving ? 'text-green-600' : 'text-orange-600'}`}>
            {isImproving ? 'Trending down – keep it up 💪' : 'Stay consistent – you got this! 💪'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
