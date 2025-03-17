
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { ChevronRight, Dumbbell, Mic, User } from "lucide-react";
import { useUser } from "@/context/UserContext";

export default function Index() {
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    // Check if user has already completed assessment
    const savedUser = localStorage.getItem("hashimfit_user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser.hasCompletedAssessment) {
        navigate("/dashboard");
      }
    }
  }, [navigate, user]);

  const features = [
    {
      icon: Dumbbell,
      title: "Personalized Workouts",
      description: "Get custom workout plans based on your fitness goals and equipment"
    },
    {
      icon: Mic,
      title: "Voice Logging",
      description: "Log your workouts with simple voice commands"
    },
    {
      icon: User,
      title: "Progress Tracking",
      description: "Track your fitness journey with detailed progress analytics"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-hashim-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="flex-1 flex flex-col">
        <header className="container pt-8 animate-fade-in">
          <Logo size="lg" />
        </header>
        
        <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
          <div 
            className="max-w-md mx-auto"
            style={{ animation: "slide-in 0.6s ease-out" }}
          >
            <h1 className="text-4xl font-bold mb-4">
              Your Personal AI Fitness Trainer
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Achieve your fitness goals with personalized workouts, nutrition plans, and voice-powered logging
            </p>
            
            <Button 
              className="hashim-button-primary text-lg py-6 px-8 animate-pulse-slow"
              onClick={() => navigate("/assessment")}
            >
              Start Your Fitness Journey
              <ChevronRight className="ml-2" />
            </Button>
          </div>
          
          <div className="mt-16 grid gap-6 md:grid-cols-3 max-w-3xl mx-auto">
            {features.map((feature, i) => (
              <div 
                key={feature.title}
                className="glassmorphism-card p-6 text-center"
                style={{ animation: `scale-in 0.5s ease-out ${300 + i * 100}ms backwards` }}
              >
                <div className="w-12 h-12 rounded-full bg-hashim-50 dark:bg-hashim-900/20 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="text-hashim-600" size={24} />
                </div>
                <h3 className="font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </main>
      </div>
      
      <footer className="py-6 border-t border-border mt-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} HashimFit. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
