
import { useState } from "react";
import { AnimatedCard } from "@/components/ui-components";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trophy, Calendar } from "lucide-react";

interface Milestone {
  id: number;
  emoji: string;
  title: string;
  date: string;
  isUserAdded?: boolean;
}

interface FitnessJourneyTimelineProps {
  milestones?: Milestone[];
  onAddMilestone?: (milestone: Omit<Milestone, 'id'>) => void;
}

export function FitnessJourneyTimeline({
  milestones = [
    { id: 1, emoji: "🎯", title: "First workout completed", date: "2 weeks ago" },
    { id: 2, emoji: "🍎", title: "First meal tracked", date: "10 days ago" },
    { id: 3, emoji: "🔥", title: "Longest streak achieved", date: "5 days ago" },
    { id: 4, emoji: "🏃", title: "Ran 5K", date: "3 days ago", isUserAdded: true }
  ],
  onAddMilestone
}: FitnessJourneyTimelineProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    emoji: "🎯",
    title: "",
    date: new Date().toISOString().split('T')[0]
  });

  const handleAddMilestone = () => {
    if (newMilestone.title.trim()) {
      onAddMilestone?.({
        ...newMilestone,
        isUserAdded: true
      });
      setNewMilestone({ emoji: "🎯", title: "", date: new Date().toISOString().split('T')[0] });
      setIsAddModalOpen(false);
    }
  };

  return (
    <>
      <AnimatedCard className="mb-6" delay={200}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Trophy size={18} className="mr-2 text-hashim-600" />
            <h3 className="font-semibold">Your Fitness Journey</h3>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center"
          >
            <Plus size={14} className="mr-1" />
            Add Milestone
          </Button>
        </div>
        
        <ScrollArea className="w-full">
          <div className="flex space-x-4 pb-2">
            {milestones.map((milestone) => (
              <div 
                key={milestone.id}
                className="flex-shrink-0 bg-gradient-to-br from-hashim-50 to-blue-50 dark:from-hashim-900/20 dark:to-blue-900/20 rounded-lg p-3 min-w-[160px]"
              >
                <div className="text-xl mb-2">{milestone.emoji}</div>
                <p className="text-sm font-medium mb-1">{milestone.title}</p>
                <p className="text-xs text-muted-foreground">{milestone.date}</p>
                {milestone.isUserAdded && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    Your Win
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </AnimatedCard>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Milestone</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="emoji">Emoji</Label>
              <Input
                id="emoji"
                value={newMilestone.emoji}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, emoji: e.target.value }))}
                placeholder="🎯"
                maxLength={2}
              />
            </div>
            <div>
              <Label htmlFor="title">Achievement</Label>
              <Input
                id="title"
                value={newMilestone.title}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ran my first 5K"
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={newMilestone.date}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleAddMilestone} className="flex-1">
                Add Milestone
              </Button>
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
