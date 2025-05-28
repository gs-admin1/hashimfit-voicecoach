
import { AnimatedCard } from "@/components/ui-components";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, TrendingUp, ExternalLink } from "lucide-react";

export function PersonalJourneyCard() {
  const achievements = [
    { id: 1, title: "First 10 Workouts", earned: true, date: "2 weeks ago" },
    { id: 2, title: "30-Day Streak", earned: false, progress: "23/30" },
    { id: 3, title: "5lb Goal Reached", earned: true, date: "1 month ago" }
  ];

  const milestones = [
    { title: "Started Muscle Gain Program", date: "3 months ago" },
    { title: "First 5-Workout Week", date: "2 months ago" },
    { title: "10lb Progress Milestone", date: "1 month ago" }
  ];

  return (
    <AnimatedCard className="mb-6" delay={500}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Trophy size={18} className="mr-2 text-hashim-600" />
          <h3 className="font-semibold">My Journey</h3>
        </div>
        <Button variant="ghost" size="sm">
          <ExternalLink size={16} />
        </Button>
      </div>
      
      {/* Achievements */}
      <div className="mb-4">
        <h4 className="text-sm font-medium mb-3 flex items-center">
          <TrendingUp size={14} className="mr-1" />
          Recent Achievements
        </h4>
        <div className="flex flex-wrap gap-2">
          {achievements.map((achievement) => (
            <Badge 
              key={achievement.id}
              variant={achievement.earned ? "default" : "secondary"}
              className={achievement.earned 
                ? "bg-hashim-100 text-hashim-800 dark:bg-hashim-900/20 dark:text-hashim-400" 
                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              }
            >
              {achievement.title}
              {!achievement.earned && achievement.progress && (
                <span className="ml-1 text-xs">({achievement.progress})</span>
              )}
            </Badge>
          ))}
        </div>
      </div>
      
      {/* Timeline */}
      <div>
        <h4 className="text-sm font-medium mb-3 flex items-center">
          <Calendar size={14} className="mr-1" />
          Key Milestones
        </h4>
        <div className="space-y-2">
          {milestones.slice(0, 3).map((milestone, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">{milestone.title}</span>
              <span className="text-xs text-hashim-600">{milestone.date}</span>
            </div>
          ))}
        </div>
      </div>
      
      <Button variant="outline" size="sm" className="w-full mt-4">
        View Full Journey
      </Button>
    </AnimatedCard>
  );
}
