
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Zap } from "lucide-react";

interface GamificationHighlightsProps {
  recentBadges: string[];
  weeklyChallenge: string;
  onJoinChallenge: () => void;
  onInviteFriends: () => void;
}

export function GamificationHighlights({ recentBadges, weeklyChallenge, onJoinChallenge, onInviteFriends }: GamificationHighlightsProps) {
  return (
    <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-white/40 dark:border-slate-700/40 shadow-lg">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-slate-800 dark:text-white flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
            Achievements
          </h4>
          <Zap className="h-5 w-5 text-yellow-500" />
        </div>

        {/* Recent Badges */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2 mb-3">
            {recentBadges.slice(0, 3).map((badge, index) => (
              <Badge 
                key={index}
                className="bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-200 text-xs px-2 py-1"
              >
                {badge}
              </Badge>
            ))}
          </div>
        </div>

        {/* Weekly Challenge */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-3 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-800 dark:text-purple-300">
                Active Challenge
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400">
                {weeklyChallenge}
              </p>
            </div>
            <Button 
              size="sm"
              onClick={onJoinChallenge}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1"
            >
              Join
            </Button>
          </div>
        </div>

        {/* Social CTA */}
        <Button 
          variant="outline"
          size="sm"
          onClick={onInviteFriends}
          className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Users className="h-4 w-4 mr-2" />
          Invite Friends & Earn Rewards
        </Button>
      </CardContent>
    </Card>
  );
}
