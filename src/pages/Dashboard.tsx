
import { Dashboard } from "@/components/Dashboard";
import { Logo } from "@/components/Logo";
import { NavigationBar } from "@/components/ui-components";
import { ChatFAB } from "@/components/ChatFAB";
import { IconButton } from "@/components/ui-components";
import { Settings, User } from "lucide-react";
import { useState } from "react";
import { UserStatsModal } from "@/components/UserStatsModal";

export default function DashboardPage() {
  const [showStatsModal, setShowStatsModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-hashim-50/50 to-white dark:from-gray-900 dark:to-gray-800">
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
      
      <main className="pt-2 px-4 animate-fade-in">
        <Dashboard />
      </main>
      
      <NavigationBar />
      <ChatFAB />
      
      <UserStatsModal 
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
      />
    </div>
  );
}
