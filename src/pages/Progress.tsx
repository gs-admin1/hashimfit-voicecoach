
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { NavigationBar, AnimatedCard, SectionTitle, Chip } from "@/components/ui-components";
import { ProgressChart } from "@/components/ProgressChart";
import { 
  Activity, 
  Weight, 
  Dumbbell,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";

export default function ProgressPage() {
  const [timeRange, setTimeRange] = useState("month");
  
  // Mock progress data
  const weightData = [
    { date: "Week 1", value: 82 },
    { date: "Week 2", value: 81.2 },
    { date: "Week 3", value: 80.5 },
    { date: "Week 4", value: 79.8 },
  ];
  
  const strengthData = [
    { exercise: "Bench Press", previous: "65kg", current: "70kg", change: "up" },
    { exercise: "Squat", previous: "90kg", current: "100kg", change: "up" },
    { exercise: "Deadlift", previous: "120kg", current: "125kg", change: "up" },
    { exercise: "Overhead Press", previous: "40kg", current: "40kg", change: "neutral" },
    { exercise: "Pull-ups", previous: "8 reps", current: "10 reps", change: "up" },
  ];
  
  const measurementsData = [
    { part: "Chest", previous: "95cm", current: "97cm", change: "up" },
    { part: "Waist", previous: "86cm", current: "84cm", change: "down" },
    { part: "Arms", previous: "36cm", current: "37cm", change: "up" },
    { part: "Thighs", previous: "58cm", current: "59cm", change: "up" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-hashim-50/50 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-border sticky top-0 z-10 animate-fade-in">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <Logo />
        </div>
      </header>
      
      <main className="pt-4 px-4 animate-fade-in pb-20">
        <div className="max-w-lg mx-auto">
          <SectionTitle 
            title="Progress" 
            subtitle="Track your fitness journey" 
          />
          
          <div className="flex space-x-3 mb-6 overflow-x-auto pb-2 scrollbar-none">
            <Chip 
              label="Week" 
              active={timeRange === "week"}
              onClick={() => setTimeRange("week")}
            />
            <Chip 
              label="Month" 
              active={timeRange === "month"}
              onClick={() => setTimeRange("month")}
            />
            <Chip 
              label="3 Months" 
              active={timeRange === "quarter"}
              onClick={() => setTimeRange("quarter")}
            />
            <Chip 
              label="Year" 
              active={timeRange === "year"}
              onClick={() => setTimeRange("year")}
            />
          </div>
          
          <AnimatedCard className="mb-6">
            <div className="flex items-center mb-4">
              <Weight className="mr-2 text-hashim-600" size={20} />
              <h3 className="font-semibold">Weight Progress</h3>
            </div>
            <div className="h-48 overflow-hidden">
              <ProgressChart />
            </div>
          </AnimatedCard>
          
          <AnimatedCard className="mb-6" delay={100}>
            <div className="flex items-center mb-4">
              <Dumbbell className="mr-2 text-hashim-600" size={20} />
              <h3 className="font-semibold">Strength Progress</h3>
            </div>
            <div className="space-y-3">
              {strengthData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="font-medium">{item.exercise}</div>
                  <div className="flex items-center">
                    <span className="text-muted-foreground mr-2">{item.previous}</span>
                    <span className="text-hashim-700 mr-2">→</span>
                    <span className="font-medium">{item.current}</span>
                    <span className="ml-2">
                      {item.change === "up" && <ArrowUp size={16} className="text-green-500" />}
                      {item.change === "down" && <ArrowDown size={16} className="text-red-500" />}
                      {item.change === "neutral" && <Minus size={16} className="text-gray-400" />}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedCard>
          
          <AnimatedCard delay={200}>
            <div className="flex items-center mb-4">
              <Activity className="mr-2 text-hashim-600" size={20} />
              <h3 className="font-semibold">Body Measurements</h3>
            </div>
            <div className="space-y-3">
              {measurementsData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="font-medium">{item.part}</div>
                  <div className="flex items-center">
                    <span className="text-muted-foreground mr-2">{item.previous}</span>
                    <span className="text-hashim-700 mr-2">→</span>
                    <span className="font-medium">{item.current}</span>
                    <span className="ml-2">
                      {item.change === "up" && <ArrowUp size={16} className="text-green-500" />}
                      {item.change === "down" && <ArrowDown size={16} className="text-red-500" />}
                      {item.change === "neutral" && <Minus size={16} className="text-gray-400" />}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedCard>
        </div>
      </main>
      
      <NavigationBar />
    </div>
  );
}
