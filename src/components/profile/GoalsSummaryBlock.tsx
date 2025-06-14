
import { AnimatedCard } from "@/components/ui-components";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Edit } from "lucide-react";

interface Goal {
  id: string;
  title: string;
  current: number;
  target: number;
  unit: string;
  type: 'bar' | 'ring';
  color: string;
}

interface GoalsSummaryBlockProps {
  goals?: Goal[];
  onUpdateGoals?: () => void;
}

export function GoalsSummaryBlock({
  goals = [
    {
      id: 'workouts',
      title: 'Weekly workouts',
      current: 3,
      target: 4,
      unit: 'workouts',
      type: 'bar',
      color: 'bg-green-500'
    },
    {
      id: 'protein',
      title: 'Protein target',
      current: 72,
      target: 100,
      unit: '% compliance',
      type: 'ring',
      color: 'bg-blue-500'
    },
    {
      id: 'steps',
      title: 'Step goal',
      current: 6300,
      target: 8000,
      unit: 'steps',
      type: 'bar',
      color: 'bg-purple-500'
    }
  ],
  onUpdateGoals
}: GoalsSummaryBlockProps) {
  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === '% compliance') return `${value}%`;
    if (unit === 'steps') return `${value.toLocaleString()}`;
    return `${value} ${unit}`;
  };

  return (
    <AnimatedCard className="mb-6" delay={300}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <span className="text-lg mr-2">🎯</span>
          <h3 className="font-semibold">Your Goals</h3>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onUpdateGoals}
          className="flex items-center"
        >
          <Edit size={14} className="mr-1" />
          Update Goals
        </Button>
      </div>
      
      <div className="space-y-4">
        {goals.map((goal) => (
          <div key={goal.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{goal.title}</span>
              <div className="text-sm">
                <span className="font-bold">{formatValue(goal.current, goal.unit)}</span>
                <span className="text-muted-foreground"> of {formatValue(goal.target, goal.unit)}</span>
              </div>
            </div>
            
            {goal.type === 'bar' ? (
              <Progress 
                value={getProgressPercentage(goal.current, goal.target)} 
                className="h-2"
              />
            ) : (
              <div className="flex items-center justify-center">
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-gray-200 dark:text-gray-700"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - getProgressPercentage(goal.current, goal.target) / 100)}`}
                      className="text-blue-500 transition-all duration-1000 ease-out"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold">{Math.round(getProgressPercentage(goal.current, goal.target))}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </AnimatedCard>
  );
}
