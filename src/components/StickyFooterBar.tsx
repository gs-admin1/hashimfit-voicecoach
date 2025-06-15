
import React from 'react';
import { Button } from "@/components/ui/button";
import { Play, Mic, Timer, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

interface StickyFooterBarProps {
  onStartWorkout?: () => void;
  onVoiceLog?: () => void;
  isWorkoutStarted?: boolean;
  workoutTime?: string;
  className?: string;
}

export function StickyFooterBar({
  onStartWorkout,
  onVoiceLog,
  isWorkoutStarted = false,
  workoutTime,
  className
}: StickyFooterBarProps) {
  return (
    <div className={cn(
      "fixed bottom-20 left-0 right-0 p-4 z-20 bg-gradient-to-t from-white via-white/95 to-transparent",
      className
    )}>
      <div className="max-w-lg mx-auto">
        <div className="bg-white/95 backdrop-blur-lg border border-violet-200/50 rounded-2xl shadow-xl p-4">
          <div className="flex items-center justify-between space-x-3">
            {/* Main CTA Button */}
            {!isWorkoutStarted ? (
              <Button
                onClick={onStartWorkout}
                size="lg"
                className="flex-1 h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Play size={18} className="mr-2" />
                Start Workout
              </Button>
            ) : (
              <div className="flex-1 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-slate-700">Workout Active</span>
                  {workoutTime && (
                    <span className="text-sm text-slate-500">• {workoutTime}</span>
                  )}
                </div>
                
                <Button
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Flag size={14} className="mr-1" />
                  Finish
                </Button>
              </div>
            )}

            {/* Voice Log Button */}
            {onVoiceLog && (
              <Button
                onClick={onVoiceLog}
                size="lg"
                variant="outline"
                className="w-12 h-12 p-0 border-violet-300 text-violet-700 hover:bg-violet-100 hover:border-violet-400 rounded-xl"
              >
                <Mic size={18} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
