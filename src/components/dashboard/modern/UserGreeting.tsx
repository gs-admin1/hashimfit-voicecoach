
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserGreetingProps {
  userName: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  className?: string;
}

export function UserGreeting({ userName, timeOfDay, className }: UserGreetingProps) {
  const getGreeting = () => {
    const greetings = {
      morning: `Good morning, ${userName}! 🌅`,
      afternoon: `Good afternoon, ${userName}! ☀️`,
      evening: `Good evening, ${userName}! 🌙`
    };
    return greetings[timeOfDay];
  };

  const getMotivation = () => {
    const motivations = {
      morning: "Ready to crush your goals today?",
      afternoon: "How's your day going so far?",
      evening: "Time to wind down and reflect!"
    };
    return motivations[timeOfDay];
  };

  return (
    <Card className={cn("p-4 bg-gradient-to-r from-blue-600 to-emerald-600 text-white border-0 animate-fade-in", className)}>
      <div className="flex items-center space-x-3">
        <Avatar className="h-12 w-12 border-2 border-white/20">
          <AvatarImage src="/placeholder.svg" />
          <AvatarFallback className="bg-white/20 text-white font-semibold">
            {userName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-lg font-bold mb-1">
            {getGreeting()}
          </h1>
          <p className="text-white/90 text-sm">
            {getMotivation()}
          </p>
        </div>
        <div className="text-2xl animate-pulse">
          💪
        </div>
      </div>
    </Card>
  );
}
