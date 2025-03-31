
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@/components/Logo";
import { NavigationBar, AnimatedCard, SectionTitle, Chip } from "@/components/ui-components";
import { ProgressChart } from "@/components/ProgressChart";
import { ChatFAB } from "@/components/ChatFAB";
import { toast } from "@/hooks/use-toast";
import { 
  Activity, 
  Weight, 
  Dumbbell,
  ArrowUp,
  ArrowDown,
  Minus,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProgressPage() {
  const { isAuthenticated, userId } = useAuth();
  const [timeRange, setTimeRange] = useState("week");
  const [isLoading, setIsLoading] = useState(false);
  const [chartType, setChartType] = useState("weight");
  
  // Mock progress data (would be fetched from the database in a real implementation)
  const [weightData, setWeightData] = useState([
    { date: "Week 1", value: 82 },
    { date: "Week 2", value: 81.2 },
    { date: "Week 3", value: 80.5 },
    { date: "Week 4", value: 79.8 },
  ]);
  
  const [caloriesData, setCaloriesData] = useState([
    { date: "Day 1", value: 2400 },
    { date: "Day 2", value: 2350 },
    { date: "Day 3", value: 2450 },
    { date: "Day 4", value: 2300 },
    { date: "Day 5", value: 2380 },
    { date: "Day 6", value: 2420 },
    { date: "Day 7", value: 2350 },
  ]);
  
  const [macrosData, setMacrosData] = useState({
    protein: [
      { date: "Day 1", value: 180 },
      { date: "Day 2", value: 175 },
      { date: "Day 3", value: 185 },
      { date: "Day 4", value: 178 },
      { date: "Day 5", value: 182 },
      { date: "Day 6", value: 180 },
      { date: "Day 7", value: 183 },
    ],
    carbs: [
      { date: "Day 1", value: 220 },
      { date: "Day 2", value: 215 },
      { date: "Day 3", value: 230 },
      { date: "Day 4", value: 210 },
      { date: "Day 5", value: 225 },
      { date: "Day 6", value: 218 },
      { date: "Day 7", value: 222 },
    ],
    fat: [
      { date: "Day 1", value: 80 },
      { date: "Day 2", value: 78 },
      { date: "Day 3", value: 82 },
      { date: "Day 4", value: 76 },
      { date: "Day 5", value: 80 },
      { date: "Day 6", value: 79 },
      { date: "Day 7", value: 81 },
    ]
  });
  
  const [strengthData, setStrengthData] = useState([
    { exercise: "Bench Press", previous: "65kg", current: "70kg", change: "up" },
    { exercise: "Squat", previous: "90kg", current: "100kg", change: "up" },
    { exercise: "Deadlift", previous: "120kg", current: "125kg", change: "up" },
    { exercise: "Overhead Press", previous: "40kg", current: "40kg", change: "neutral" },
    { exercise: "Pull-ups", previous: "8 reps", current: "10 reps", change: "up" },
    { exercise: "Mile Run", previous: "8:45", current: "8:20", change: "up" },
    { exercise: "Dips", previous: "12 reps", current: "15 reps", change: "up" },
  ]);
  
  const [measurementsData, setMeasurementsData] = useState([
    { part: "Chest", previous: "95cm", current: "97cm", change: "up" },
    { part: "Waist", previous: "86cm", current: "84cm", change: "down" },
    { part: "Arms", previous: "36cm", current: "37cm", change: "up" },
    { part: "Thighs", previous: "58cm", current: "59cm", change: "up" },
    { part: "Calves", previous: "38cm", current: "39cm", change: "up" },
    { part: "Shoulders", previous: "120cm", current: "122cm", change: "up" },
  ]);

  // Function to fetch progress data based on the selected timeframe
  const fetchProgressData = async (range: string) => {
    setIsLoading(true);
    
    try {
      // In a real implementation, you would fetch data from the database
      // based on the user ID and timeframe
      
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // You would update the state with real data here
      
      setTimeRange(range);
    } catch (error) {
      console.error("Error fetching progress data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch progress data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchProgressData(timeRange);
    }
  }, [isAuthenticated, userId]);

  // Get relevant data for currently selected chart type
  const getChartData = () => {
    switch (chartType) {
      case "weight":
        return weightData;
      case "calories":
        return caloriesData;
      case "protein":
        return macrosData.protein;
      case "carbs":
        return macrosData.carbs;
      case "fat":
        return macrosData.fat;
      default:
        return weightData;
    }
  };

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
              onClick={() => fetchProgressData("week")}
            />
            <Chip 
              label="Month" 
              active={timeRange === "month"}
              onClick={() => fetchProgressData("month")}
            />
            <Chip 
              label="3 Months" 
              active={timeRange === "quarter"}
              onClick={() => fetchProgressData("quarter")}
            />
            <Chip 
              label="6 Months" 
              active={timeRange === "half-year"}
              onClick={() => fetchProgressData("half-year")}
            />
            <Chip 
              label="Year" 
              active={timeRange === "year"}
              onClick={() => fetchProgressData("year")}
            />
          </div>
          
          <AnimatedCard className="mb-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <Button 
                size="sm" 
                variant={chartType === "weight" ? "default" : "outline"}
                onClick={() => setChartType("weight")}
                className="flex items-center"
              >
                <Weight className="mr-2" size={16} />
                Weight
              </Button>
              <Button 
                size="sm" 
                variant={chartType === "calories" ? "default" : "outline"}
                onClick={() => setChartType("calories")}
              >
                Calories
              </Button>
              <Button 
                size="sm" 
                variant={chartType === "protein" ? "default" : "outline"}
                onClick={() => setChartType("protein")}
              >
                Protein
              </Button>
              <Button 
                size="sm" 
                variant={chartType === "carbs" ? "default" : "outline"}
                onClick={() => setChartType("carbs")}
              >
                Carbs
              </Button>
              <Button 
                size="sm" 
                variant={chartType === "fat" ? "default" : "outline"}
                onClick={() => setChartType("fat")}
              >
                Fat
              </Button>
            </div>
            
            <div className="h-48 overflow-hidden">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hashim-600"></div>
                </div>
              ) : (
                <ProgressChart data={getChartData()} />
              )}
            </div>
          </AnimatedCard>
          
          <AnimatedCard className="mb-6" delay={100}>
            <div className="flex items-center mb-4">
              <Dumbbell className="mr-2 text-hashim-600" size={20} />
              <h3 className="font-semibold">Exercise Progress</h3>
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
      <ChatFAB />
    </div>
  );
}
