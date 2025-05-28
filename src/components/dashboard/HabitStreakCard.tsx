
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Award, Flame, Droplets, Moon, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface HabitStreakCardProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

export function HabitStreakCard({ 
  isCollapsed = false, 
  onToggleCollapse,
  className 
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
  
  // Mock habit data
  const habits = [
    { id: 1, name: "Workout", icon: Heart, streak: 5, completed: true, color: "bg-red-100 text-red-600" },
    { id: 2, name: "Water Intake", icon: Droplets, streak: 12, completed: true, color: "bg-blue-100 text-blue-600" },
    { id: 3, name: "Sleep 8hrs", icon: Moon, streak: 3, completed: false, color: "bg-purple-100 text-purple-600" }
  ];
  
  const longestStreak = Math.max(...habits.map(h => h.streak));
  const totalBadges = 3; // Bronze, Silver, Gold badges earned

  return (
    <Card className={cn("transition-all duration-300", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Flame className="h-4 w-4 text-yellow-600" />
            </div>
            <CardTitle className="text-lg">Habit Streaks</CardTitle>
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
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  habit.completed 
                    ? 'bg-green-500 border-green-500' 
                    : 'border-gray-300'
                }`}>
                  {habit.completed && <span className="text-white text-xs">✓</span>}
                </div>
              </div>
            ))}
          </div>
          
          <Button variant="outline" size="sm" className="w-full">
            Log Today's Habits
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
