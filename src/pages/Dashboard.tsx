
import { Dashboard } from "@/components/Dashboard";
import { Logo } from "@/components/Logo";
import { NavigationBar } from "@/components/ui-components";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-hashim-50/50 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-border sticky top-0 z-10 animate-fade-in">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <Logo />
        </div>
      </header>
      
      <main className="pt-4 px-4 animate-fade-in">
        <Dashboard />
      </main>
      
      <NavigationBar />
    </div>
  );
}
