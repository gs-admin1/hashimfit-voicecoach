
import { useUser } from "@/context/UserContext";
import { AnimatedCard, SectionTitle } from "@/components/ui-components";
import { Logo } from "@/components/Logo";
import { NavigationBar } from "@/components/ui-components";
import { 
  User, 
  Weight, 
  Dumbbell, 
  Calendar, 
  Apple,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("hashimfit_user");
    setUser({
      name: "",
      age: 0,
      gender: "male",
      height: 0,
      weight: 0,
      fitnessGoal: "muscle_gain",
      workoutFrequency: 3,
      diet: "standard",
      equipment: "full_gym",
      hasCompletedAssessment: false
    });
    navigate("/");
  };

  // Map fitness goal to readable text
  const fitnessGoalMap = {
    muscle_gain: "Muscle Gain",
    weight_loss: "Weight Loss",
    endurance: "Endurance",
    sport_specific: "Sport Specific Training"
  };

  // Map diet preference to readable text
  const dietMap = {
    standard: "Standard",
    vegetarian: "Vegetarian",
    vegan: "Vegan",
    keto: "Keto",
    paleo: "Paleo",
    gluten_free: "Gluten Free"
  };

  // Map equipment to readable text
  const equipmentMap = {
    full_gym: "Full Gym Access",
    home_gym: "Home Gym Setup",
    minimal: "Minimal Equipment",
    bodyweight_only: "Bodyweight Only"
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-hashim-50/50 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-border sticky top-0 z-10 animate-fade-in">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <Logo />
        </div>
      </header>
      
      <main className="pt-6 px-4 pb-24 animate-fade-in max-w-lg mx-auto">
        <SectionTitle title="Profile" subtitle="Your fitness details" />
        
        <div className="mb-8 text-center">
          <div className="w-24 h-24 rounded-full bg-hashim-100 dark:bg-hashim-900/20 mx-auto flex items-center justify-center mb-4">
            <User size={40} className="text-hashim-600" />
          </div>
          <h2 className="text-2xl font-bold">{user?.name}</h2>
          <p className="text-muted-foreground">
            {user?.age} years • {user?.gender === "male" ? "Male" : user?.gender === "female" ? "Female" : "Other"}
          </p>
        </div>
        
        <AnimatedCard className="mb-6">
          <h3 className="font-semibold flex items-center mb-4">
            <User size={18} className="mr-2 text-hashim-600" />
            Personal Details
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <p className="text-muted-foreground">Height</p>
              <p className="font-medium">{user?.height}cm</p>
            </div>
            <div className="flex justify-between">
              <p className="text-muted-foreground">Weight</p>
              <p className="font-medium">{user?.weight}kg</p>
            </div>
          </div>
        </AnimatedCard>
        
        <AnimatedCard className="mb-6" delay={100}>
          <h3 className="font-semibold flex items-center mb-4">
            <Dumbbell size={18} className="mr-2 text-hashim-600" />
            Fitness Preferences
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <p className="text-muted-foreground">Goal</p>
              <p className="font-medium">
                {user?.fitnessGoal ? fitnessGoalMap[user.fitnessGoal] : ""}
              </p>
            </div>
            <div className="flex justify-between">
              <p className="text-muted-foreground">Workout Frequency</p>
              <p className="font-medium">
                {user?.workoutFrequency} days / week
              </p>
            </div>
            <div className="flex justify-between">
              <p className="text-muted-foreground">Equipment</p>
              <p className="font-medium">
                {user?.equipment ? equipmentMap[user.equipment] : ""}
              </p>
            </div>
          </div>
        </AnimatedCard>
        
        <AnimatedCard className="mb-8" delay={200}>
          <h3 className="font-semibold flex items-center mb-4">
            <Apple size={18} className="mr-2 text-hashim-600" />
            Diet Preferences
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <p className="text-muted-foreground">Diet Type</p>
              <p className="font-medium">
                {user?.diet ? dietMap[user.diet] : ""}
              </p>
            </div>
          </div>
        </AnimatedCard>
        
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            className="hashim-button-outline flex items-center"
            onClick={handleLogout}
          >
            <LogOut size={16} className="mr-2" />
            Log Out
          </Button>
        </div>
      </main>
      
      <NavigationBar />
    </div>
  );
}
