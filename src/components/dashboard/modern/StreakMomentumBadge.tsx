
import { Card, CardContent } from "@/components/ui/card";
import { Flame, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakMomentumBadgeProps {
  streak: number;
  momentum: 'up' | 'down' | 'steady';
  className?: string;
}

export function StreakMomentumBadge({ streak, momentum, className }: StreakMomentumBadgeProps) {
  const getMomentumColor = () => {
    switch (momentum) {
      case 'up': return 'from-orange-400 to-red-500';
      case 'down': return 'from-gray-400 to-gray-500';
      default: return 'from-yellow-400 to-orange-500';
    }
  };

  const getMomentumIcon = () => {
    switch (momentum) {
      case 'up': return <TrendingUp className="h-4 w-4" />;
      case 'down': return <TrendingDown className="h-4 w-4" />;
      default: return <Flame className="h-4 w-4" />;
    }
  };

  const getMessage = () => {
    if (streak >= 7) return "You're on fire! 🔥 Amazing consistency!";
    if (streak >= 3) return "Great momentum! Keep it going! 💪";
    if (streak >= 1) return "Good start! Build that streak! 🚀";
    return "Ready to start a new streak? 💫";
  };

  return (
    <Card className={cn(
      `border-0 shadow-lg bg-gradient-to-r ${getMomentumColor()} text-white transform transition-all duration-300 hover:scale-[1.02]`,
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
              <Flame className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{streak}-Day Streak!</h3>
              <p className="text-white/90 text-sm">{getMessage()}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-1 text-white/80">
              {getMomentumIcon()}
              <span className="text-sm font-medium capitalize">{momentum}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
