
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ArrowRight } from "lucide-react";

interface CommunityPost {
  user: string;
  activity: string;
  time: string;
}

interface CommunityFeedPreviewProps {
  groupActivity: string;
  recentPosts: CommunityPost[];
  onViewCommunity: () => void;
}

export function CommunityFeedPreview({ groupActivity, recentPosts, onViewCommunity }: CommunityFeedPreviewProps) {
  return (
    <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-white/40 dark:border-slate-700/40 shadow-lg">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-slate-800 dark:text-white flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-500" />
            Community
          </h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewCommunity}
            className="text-blue-600 hover:text-blue-700 p-0"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Group Activity Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-3 mb-4">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-300 text-center">
            {groupActivity}
          </p>
        </div>

        {/* Recent Posts */}
        <div className="space-y-3 mb-4">
          {recentPosts.slice(0, 2).map((post, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <span className="font-medium">{post.user}</span> {post.activity}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{post.time}</p>
              </div>
              <div className="text-lg">👏</div>
            </div>
          ))}
        </div>

        <Button 
          variant="outline"
          size="sm"
          onClick={onViewCommunity}
          className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/30"
        >
          <Users className="h-4 w-4 mr-2" />
          Join the Conversation
        </Button>
      </CardContent>
    </Card>
  );
}
