
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { X, Heart, Activity, Weight, Dumbbell, Apple, TrendingUp, Target, BarChart3 } from "lucide-react";

interface UserStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserStatsModal({ isOpen, onClose }: UserStatsModalProps) {
  const { user } = useUser();
  
  if (!user) return null;
  
  // Function to convert weight from kg to lbs
  const kgToLbs = (kg: number) => Math.round(kg * 2.205);
  
  // Function to convert height from cm to ft/in
  const cmToFtIn = (cm: number) => {
    const totalInches = Math.round(cm / 2.54);
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;
    return `${feet}'${inches}"`;
  };
  
  // Mock strength metrics data
  const strengthMetrics = [
    { exercise: "Bench Press", max: "100kg (220lbs)", trend: "up" },
    { exercise: "Squat", max: "140kg (309lbs)", trend: "up" },
    { exercise: "Deadlift", max: "160kg (353lbs)", trend: "up" },
    { exercise: "Pull-ups", max: "15 reps", trend: "up" },
  ];
  
  // Mock progress areas
  const progressAreas = ["Overhead Press", "Dips", "Chin-ups", "Romanian Deadlift"];
  
  // Mock improvement areas
  const improvementAreas = ["Leg Extensions", "Core Stability", "Shoulder Mobility"];
  
  // Mock diet suggestions
  const dietSuggestions = [
    "Increase protein intake to support muscle recovery",
    "Consider adding more complex carbs for workout energy",
    "Stay hydrated during intense strength sessions",
    "Consider adding omega-3 supplements for joint health"
  ];
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Your Fitness Stats
          </DialogTitle>
          <DialogClose className="absolute right-4 top-4">
            <X size={18} />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        
        <div className="mt-4 grid gap-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-hashim-50 p-4 rounded-lg flex flex-col items-center justify-center">
              <Weight className="text-hashim-600 mb-2" size={24} />
              <div className="text-sm text-muted-foreground">Current Weight</div>
              <div className="font-bold text-lg">{user.weight}kg</div>
              <div className="text-xs text-muted-foreground">({kgToLbs(user.weight)}lbs)</div>
            </div>
            
            <div className="bg-hashim-50 p-4 rounded-lg flex flex-col items-center justify-center">
              <Activity className="text-hashim-600 mb-2" size={24} />
              <div className="text-sm text-muted-foreground">Height</div>
              <div className="font-bold text-lg">{user.height}cm</div>
              <div className="text-xs text-muted-foreground">({cmToFtIn(user.height)})</div>
            </div>
            
            <div className="bg-hashim-50 p-4 rounded-lg flex flex-col items-center justify-center">
              <Heart className="text-hashim-600 mb-2" size={24} />
              <div className="text-sm text-muted-foreground">Age</div>
              <div className="font-bold text-lg">{user.age}</div>
              <div className="text-xs text-muted-foreground">Years</div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-lg flex items-center mb-3">
              <Dumbbell size={18} className="mr-2 text-hashim-600" />
              Strength Metrics
            </h3>
            <div className="border rounded-lg divide-y">
              {strengthMetrics.map((metric, index) => (
                <div key={index} className="p-3 flex justify-between items-center">
                  <div>
                    <div className="font-medium">{metric.exercise}</div>
                    <div className="text-sm text-muted-foreground">{metric.max}</div>
                  </div>
                  <div className={`text-${metric.trend === 'up' ? 'green' : 'red'}-500`}>
                    {metric.trend === 'up' ? '↑' : '↓'}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-lg flex items-center mb-3">
              <TrendingUp size={18} className="mr-2 text-hashim-600" />
              Progress Areas
            </h3>
            <div className="border rounded-lg p-3">
              <div className="grid grid-cols-2 gap-2">
                {progressAreas.map((area, index) => (
                  <div key={index} className="bg-green-50 text-green-700 py-2 px-3 rounded-md text-sm flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    {area}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-lg flex items-center mb-3">
              <Target size={18} className="mr-2 text-hashim-600" />
              Areas for Improvement
            </h3>
            <div className="border rounded-lg p-3">
              <div className="grid grid-cols-2 gap-2">
                {improvementAreas.map((area, index) => (
                  <div key={index} className="bg-amber-50 text-amber-700 py-2 px-3 rounded-md text-sm flex items-center">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                    {area}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-lg flex items-center mb-3">
              <Apple size={18} className="mr-2 text-hashim-600" />
              Diet Suggestions
            </h3>
            <div className="border rounded-lg p-3">
              <ul className="space-y-2 text-sm">
                {dietSuggestions.map((suggestion, index) => (
                  <li key={index} className="flex">
                    <span className="text-hashim-600 mr-2">•</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <Button 
            onClick={onClose}
            className="bg-hashim-600 hover:bg-hashim-700 text-white mt-4"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
