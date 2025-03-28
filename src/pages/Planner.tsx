
import { Logo } from "@/components/Logo";
import { NavigationBar } from "@/components/ui-components";
import { ChatFAB } from "@/components/ChatFAB";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function PlannerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-hashim-50/50 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-border sticky top-0 z-10 animate-fade-in">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <Logo />
          <Button className="bg-hashim-600 hover:bg-hashim-700 text-white">
            <Plus size={16} className="mr-2" />
            Log Workout Session
          </Button>
        </div>
      </header>
      
      <main className="pt-4 px-4 animate-fade-in pb-20">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold mb-6">Workout Planner</h1>
          
          <div className="text-center py-16">
            <p className="text-muted-foreground">
              Planner content will be displayed here.
            </p>
          </div>
        </div>
      </main>
      
      <NavigationBar />
      <ChatFAB />
    </div>
  );
}
