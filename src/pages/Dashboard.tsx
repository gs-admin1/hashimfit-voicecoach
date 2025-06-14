
import { ModernDashboard } from "@/components/ModernDashboard";
import { Logo } from "@/components/Logo";
import { NavigationBar } from "@/components/ui-components";
import { ChatFAB } from "@/components/ChatFAB";
import { RestTimerOverlay } from "@/components/RestTimerOverlay";
import { IconButton } from "@/components/ui-components";
import { Settings, User, Mic, Camera } from "lucide-react";
import { useState } from "react";
import { UserStatsModal } from "@/components/UserStatsModal";
import { Button } from "@/components/ui/button";
import { useDashboardHandlers } from "@/hooks/useDashboardHandlers";

export default function DashboardPage() {
  const [showStatsModal, setShowStatsModal] = useState(false);
  const { handleLogWorkoutVoice, handleSnapMeal } = useDashboardHandlers();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-emerald-50 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-border sticky top-0 z-10 animate-fade-in">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <Logo />
          <div className="flex items-center space-x-2">
            <IconButton 
              icon={Settings}
              variant="outline"
              onClick={() => {}}
            />
            <IconButton 
              icon={User}
              variant="outline"
              onClick={() => setShowStatsModal(true)}
            />
          </div>
        </div>
      </header>
      
      <main className="animate-fade-in">
        <ModernDashboard />
      </main>
      
      <NavigationBar />
      
      {/* Floating Action Buttons */}
      <div className="fixed bottom-28 left-0 right-0 z-40 flex justify-center">
        <div className="flex items-center justify-between w-64 px-4">
          {/* Log Workout Button */}
          <Button
            onClick={handleLogWorkoutVoice}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 p-0"
          >
            <Mic size={24} />
          </Button>
          
          {/* Log Meal Button */}
          <Button
            onClick={handleSnapMeal}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 p-0"
          >
            <Camera size={24} />
          </Button>
          
          {/* Spacer for ChatFAB (it positions itself) */}
          <div className="w-14 h-14"></div>
        </div>
      </div>
      
      <ChatFAB />
      <RestTimerOverlay />
      
      <UserStatsModal 
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
      />
    </div>
  );
}
