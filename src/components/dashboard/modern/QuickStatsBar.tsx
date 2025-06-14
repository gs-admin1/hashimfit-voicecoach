
import { Zap, Trophy, Target } from "lucide-react";

interface QuickStatsBarProps {
  userName: string;
  streak: number;
  xpPoints: number;
  level: number;
  nextLevelXP: number;
}

export function QuickStatsBar({ userName, streak, xpPoints, level, nextLevelXP }: QuickStatsBarProps) {
  const xpProgress = (xpPoints / nextLevelXP) * 100;

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Greeting */}
        <div>
          <h1 className="text-lg font-bold text-slate-800 dark:text-white">
            Hey {userName}! 👋
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Ready to crush today?
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center space-x-4">
          {/* Streak */}
          <div className="flex items-center space-x-1">
            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
              <Zap className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-slate-800 dark:text-white">{streak}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">streak</div>
            </div>
          </div>

          {/* Level */}
          <div className="flex items-center space-x-1">
            <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center">
              <Trophy className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-slate-800 dark:text-white">L{level}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{Math.floor(xpProgress)}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
          <span>{xpPoints} XP</span>
          <span>Level {level + 1} at {nextLevelXP} XP</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-violet-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${xpProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
