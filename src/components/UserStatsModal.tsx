
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { X, Heart, Activity, Weight, Dumbbell, Apple } from "lucide-react";

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
  
  const fitnessGoalText = {
    muscle_gain: "Muscle Gain",
    weight_loss: "Weight Loss",
    endurance: "Endurance",
    sport_specific: "Sport Specific"
  };
  
  const dietText = {
    standard: "Standard",
    vegetarian: "Vegetarian",
    vegan: "Vegan",
    keto: "Keto",
    paleo: "Paleo",
    gluten_free: "Gluten Free"
  };
  
  const equipmentText = {
    full_gym: "Full Gym Access",
    home_gym: "Home Gym Setup",
    minimal: "Minimal Equipment",
    bodyweight_only: "Bodyweight Only"
  };
  
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
          
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Your Fitness Profile</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center text-hashim-600 mb-2">
                  <Dumbbell size={18} className="mr-2" />
                  <span className="font-medium">Fitness Goal</span>
                </div>
                <div>{fitnessGoalText[user.fitnessGoal as keyof typeof fitnessGoalText] || "Not specified"}</div>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center text-hashim-600 mb-2">
                  <Activity size={18} className="mr-2" />
                  <span className="font-medium">Workout Frequency</span>
                </div>
                <div>{user.workoutFrequency} days/week</div>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center text-hashim-600 mb-2">
                  <Apple size={18} className="mr-2" />
                  <span className="font-medium">Diet</span>
                </div>
                <div>{dietText[user.diet as keyof typeof dietText] || "Not specified"}</div>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center text-hashim-600 mb-2">
                  <Dumbbell size={18} className="mr-2" />
                  <span className="font-medium">Equipment</span>
                </div>
                <div>{equipmentText[user.equipment as keyof typeof equipmentText] || "Not specified"}</div>
              </div>
            </div>
            
            {user.targetWeight && (
              <div className="border rounded-lg p-4">
                <div className="flex items-center text-hashim-600 mb-2">
                  <Weight size={18} className="mr-2" />
                  <span className="font-medium">Target Weight</span>
                </div>
                <div>
                  {user.targetWeight}kg ({kgToLbs(user.targetWeight)}lbs)
                </div>
              </div>
            )}
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
