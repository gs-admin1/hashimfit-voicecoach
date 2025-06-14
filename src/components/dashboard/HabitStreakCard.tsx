
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Award, Flame, Droplets, Moon, Heart, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Habit {
  id: number;
  name: string;
  icon: any;
  streak: number;
  completed: boolean;
  color: string;
}

interface HabitStreakCardProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
  habits?: Habit[];
  onTrackHabits?: () => void;
}

export function HabitStreakCard({ 
  isCollapsed = false, 
  onToggleCollapse,
  className,
  habits = [],
  onTrackHabits
}: HabitStreakCardProps) {
  const [localCollapsed, setLocalCollapsed] = useState(isCollapsed);
  
  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setLocalCollapsed(!localCollapsed);
    }
  };
  
  const collapsed = onToggleCollapse ? isCollapsed : localCollapsed;
  
  const longestStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0;
  const totalBadges = Math.floor(longestStreak / 7); // Badge every 7 days

  return (
    <Card className={cn("transition-all duration-300 animate-fade-in", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Flame className="h-4 w-4 text-yellow-600" />
            </div>
            <CardTitle className="text-lg">🔥 Habit Streaks</CardTitle>
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
        <CardContent className="space-y-4">
          {habits.length === 0 ? (
            <div className="text-center py-8">
              <Plus size={48} className="mx-auto mb-4 opacity-20 text-yellow-500" />
              <p className="text-muted-foreground mb-3">
                Every habit counts. What's one thing you did today?
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="hover:bg-yellow-50 hover:border-yellow-300"
                onClick={onTrackHabits}
              >
                <Plus className="h-4 w-4 mr-2" />
                Track Habits
              </Button>
            </div>
          ) : (
            <>
              {/* Streak Summary */}
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                <div>
                  <p className="text-2xl font-bold text-yellow-600">{longestStreak}</p>
                  <p className="text-sm text-muted-foreground">day streak</p>
                </div>
                <div className="flex items-center space-x-1">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <Badge variant="secondary">{totalBadges} badges</Badge>
                </div>
              </div>
              
              {/* Individual Habits */}
              <div className="space-y-2">
                {habits.map((habit) => (
                  <div key={habit.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${habit.color}`}>
                        <habit.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{habit.name}</p>
                        <p className="text-xs text-muted-foreground">{habit.streak} day streak</p>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      habit.completed 
                        ? 'bg-green-500 border-green-500 scale-110' 
                        : 'border-gray-300 hover:border-green-300'
                    }`}>
                      {habit.completed && <span className="text-white text-xs">✓</span>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full hover:bg-yellow-50" 
            onClick={onTrackHabits}
          >
            {habits.length === 0 ? "Start Tracking Habits" : "Update Today's Habits"}
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
