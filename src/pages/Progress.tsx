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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function ProgressPage() {
  const { isAuthenticated, userId } = useAuth();
  const [timeRange, setTimeRange] = useState("week");
  const [isLoading, setIsLoading] = useState(false);

  // Toggle state for each metric
  const [metrics, setMetrics] = useState({
    weight: true,
    calories: true,
    protein: true,
    carbs: true,
    fat: true
  });

  // Combined data for multi-metric chart
  const [multiMetricData, setMultiMetricData] = useState([
    { date: "Mon", weight: 80.8, calories: 2400, protein: 180, carbs: 215, fat: 80 },
    { date: "Tue", weight: 80.5, calories: 2350, protein: 175, carbs: 215, fat: 78 },
    { date: "Wed", weight: 80.3, calories: 2450, protein: 185, carbs: 230, fat: 82 },
    { date: "Thu", weight: 80.0, calories: 2300, protein: 178, carbs: 210, fat: 76 },
    { date: "Fri", weight: 79.8, calories: 2380, protein: 182, carbs: 225, fat: 80 },
    { date: "Sat", weight: 79.5, calories: 2420, protein: 180, carbs: 218, fat: 79 },
    { date: "Sun", weight: 79.3, calories: 2350, protein: 183, carbs: 222, fat: 81 },
  ]);
  
  // Keep separate datasets for backward compatibility
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
      { date: "Day 1", value: 215 },
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
      
      // Update data based on the selected range
      // In a real app, this would be API data
      if (range === "month") {
        setMultiMetricData([
          { date: "Week 1", weight: 82, calories: 2400, protein: 180, carbs: 220, fat: 78 },
          { date: "Week 2", weight: 81.5, calories: 2380, protein: 178, carbs: 215, fat: 79 },
          { date: "Week 3", weight: 80.8, calories: 2420, protein: 182, carbs: 225, fat: 77 },
          { date: "Week 4", weight: 79.8, calories: 2350, protein: 185, carbs: 210, fat: 75 },
        ]);
      } else if (range === "quarter") {
        setMultiMetricData([
          { date: "Jan", weight: 83, calories: 2450, protein: 175, carbs: 230, fat: 82 },
          { date: "Feb", weight: 82, calories: 2400, protein: 180, carbs: 220, fat: 80 },
          { date: "Mar", weight: 80.5, calories: 2350, protein: 185, carbs: 215, fat: 78 },
        ]);
      } else if (range === "half-year") {
        setMultiMetricData([
          { date: "Jan", weight: 85, calories: 2500, protein: 170, carbs: 235, fat: 85 },
          { date: "Feb", weight: 84, calories: 2480, protein: 175, carbs: 230, fat: 83 },
          { date: "Mar", weight: 83, calories: 2450, protein: 175, carbs: 230, fat: 82 },
          { date: "Apr", weight: 82, calories: 2400, protein: 180, carbs: 220, fat: 80 },
          { date: "May", weight: 81, calories: 2380, protein: 182, carbs: 218, fat: 79 },
          { date: "Jun", weight: 80.5, calories: 2350, protein: 185, carbs: 215, fat: 78 },
        ]);
      } else if (range === "year") {
        setMultiMetricData([
          { date: "Jan", weight: 85, calories: 2500, protein: 170, carbs: 235, fat: 85 },
          { date: "Feb", weight: 84, calories: 2480, protein: 175, carbs: 230, fat: 83 },
          { date: "Mar", weight: 83, calories: 2450, protein: 175, carbs: 230, fat: 82 },
          { date: "Apr", weight: 82, calories: 2400, protein: 180, carbs: 220, fat: 80 },
          { date: "May", weight: 81, calories: 2380, protein: 182, carbs: 218, fat: 79 },
          { date: "Jun", weight: 80.5, calories: 2350, protein: 185, carbs: 215, fat: 78 },
          { date: "Jul", weight: 80, calories: 2330, protein: 187, carbs: 212, fat: 77 },
          { date: "Aug", weight: 79.5, calories: 2320, protein: 190, carbs: 210, fat: 76 },
          { date: "Sep", weight: 79, calories: 2300, protein: 192, carbs: 208, fat: 75 },
          { date: "Oct", weight: 78.5, calories: 2290, protein: 195, carbs: 205, fat: 74 },
          { date: "Nov", weight: 78, calories: 2280, protein: 197, carbs: 200, fat: 73 },
          { date: "Dec", weight: 77.5, calories: 2270, protein: 200, carbs: 195, fat: 72 },
        ]);
      } else {
        // week is default
        setMultiMetricData([
          { date: "Mon", weight: 80.8, calories: 2400, protein: 180, carbs: 215, fat: 80 },
          { date: "Tue", weight: 80.5, calories: 2350, protein: 175, carbs: 215, fat: 78 },
          { date: "Wed", weight: 80.3, calories: 2450, protein: 185, carbs: 230, fat: 82 },
          { date: "Thu", weight: 80.0, calories: 2300, protein: 178, carbs: 210, fat: 76 },
          { date: "Fri", weight: 79.8, calories: 2380, protein: 182, carbs: 225, fat: 80 },
          { date: "Sat", weight: 79.5, calories: 2420, protein: 180, carbs: 218, fat: 79 },
          { date: "Sun", weight: 79.3, calories: 2350, protein: 183, carbs: 222, fat: 81 },
        ]);
      }
      
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

  const toggleMetric = (metric: keyof typeof metrics) => {
    setMetrics(prev => ({
      ...prev,
      [metric]: !prev[metric]
    }));
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
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="weight-toggle" 
                  checked={metrics.weight}
                  onCheckedChange={() => toggleMetric('weight')}
                />
                <Label htmlFor="weight-toggle" className="flex items-center">
                  <span className="inline-block w-3 h-3 mr-1 rounded-full" style={{ backgroundColor: '#be123c' }}></span>
                  Weight
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="calories-toggle" 
                  checked={metrics.calories}
                  onCheckedChange={() => toggleMetric('calories')}
                />
                <Label htmlFor="calories-toggle" className="flex items-center">
                  <span className="inline-block w-3 h-3 mr-1 rounded-full" style={{ backgroundColor: '#0891b2' }}></span>
                  Calories
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="protein-toggle" 
                  checked={metrics.protein}
                  onCheckedChange={() => toggleMetric('protein')}
                />
                <Label htmlFor="protein-toggle" className="flex items-center">
                  <span className="inline-block w-3 h-3 mr-1 rounded-full" style={{ backgroundColor: '#4d7c0f' }}></span>
                  Protein
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="carbs-toggle" 
                  checked={metrics.carbs}
                  onCheckedChange={() => toggleMetric('carbs')}
                />
                <Label htmlFor="carbs-toggle" className="flex items-center">
                  <span className="inline-block w-3 h-3 mr-1 rounded-full" style={{ backgroundColor: '#b45309' }}></span>
                  Carbs
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="fat-toggle" 
                  checked={metrics.fat}
                  onCheckedChange={() => toggleMetric('fat')}
                />
                <Label htmlFor="fat-toggle" className="flex items-center">
                  <span className="inline-block w-3 h-3 mr-1 rounded-full" style={{ backgroundColor: '#7c3aed' }}></span>
                  Fat
                </Label>
              </div>
            </div>
            
            <div className="h-48 overflow-hidden">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hashim-600"></div>
                </div>
              ) : (
                <ProgressChart 
                  data={multiMetricData} 
                  metrics={metrics} 
                />
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
