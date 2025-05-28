
import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { useAuth } from "@/hooks/useAuth";
import { AnimatedCard, SectionTitle } from "@/components/ui-components";
import { Logo } from "@/components/Logo";
import { NavigationBar } from "@/components/ui-components";
import { 
  User, 
  Settings, 
  Trophy,
  Calendar,
  Edit,
  Bot,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { ProfileOverviewCard } from "@/components/profile/ProfileOverviewCard";
import { BodyMetricsCard } from "@/components/profile/BodyMetricsCard";
import { FitnessPreferencesCard } from "@/components/profile/FitnessPreferencesCard";
import { NutritionPreferencesCard } from "@/components/profile/NutritionPreferencesCard";
import { AICoachSuggestionsCard } from "@/components/profile/AICoachSuggestionsCard";
import { AppSettingsCard } from "@/components/profile/AppSettingsCard";
import { PersonalJourneyCard } from "@/components/profile/PersonalJourneyCard";

export default function ProfilePage() {
  const { user, updateUser } = useUser();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [isReassessing, setIsReassessing] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleReassessProfile = async () => {
    setIsReassessing(true);
    // Simulate reassessment process
    setTimeout(() => {
      setIsReassessing(false);
      toast({
        title: "Profile Reassessed",
        description: "Your fitness plan has been updated based on your current progress.",
      });
    }, 2000);
  };

  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "Your fitness data will be prepared and emailed to you shortly.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-hashim-50/50 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-border sticky top-0 z-10 animate-fade-in">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <Logo />
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleExportData}
              className="flex items-center"
            >
              <Download size={16} className="mr-1" />
              Export
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLogout}
              className="flex items-center text-destructive hover:text-destructive"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>
      
      <main className="pt-6 px-4 pb-24 animate-fade-in max-w-lg mx-auto">
        <SectionTitle title="Profile" subtitle="Your fitness control center" />
        
        {/* Profile Overview */}
        <ProfileOverviewCard user={user} />
        
        {/* AI Reassessment Button */}
        <AnimatedCard className="mb-6" delay={100}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Bot size={20} className="text-hashim-600 mr-3" />
              <div>
                <h3 className="font-semibold">AI Profile Assistant</h3>
                <p className="text-sm text-muted-foreground">
                  Get personalized recommendations
                </p>
              </div>
            </div>
            <Button 
              variant="outline"
              size="sm"
              onClick={handleReassessProfile}
              disabled={isReassessing}
              className="hashim-button-outline"
            >
              {isReassessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-hashim-600 mr-2"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Edit size={16} className="mr-2" />
                  Reassess
                </>
              )}
            </Button>
          </div>
        </AnimatedCard>

        {/* AI Coach Suggestions */}
        <AICoachSuggestionsCard />
        
        {/* Body Metrics */}
        <BodyMetricsCard user={user} updateUser={updateUser} />
        
        {/* Fitness Preferences */}
        <FitnessPreferencesCard user={user} updateUser={updateUser} />
        
        {/* Nutrition Preferences */}
        <NutritionPreferencesCard user={user} updateUser={updateUser} />
        
        {/* Personal Journey */}
        <PersonalJourneyCard />
        
        {/* App Settings */}
        <AppSettingsCard />
      </main>
      
      <NavigationBar />
    </div>
  );
}
