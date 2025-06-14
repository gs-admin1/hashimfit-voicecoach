
import { Flame } from "lucide-react";

interface UserGreetingProps {
  userName: string;
}

export function UserGreeting({ userName }: UserGreetingProps) {
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {getTimeBasedGreeting()}, {userName} 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
          Ready to crush your fitness goals?
        </p>
      </div>
      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
        <Flame className="h-6 w-6 text-white" />
      </div>
    </div>
  );
}
