
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@/components/Logo";
import { NavigationBar, AnimatedCard, SectionTitle, Chip } from "@/components/ui-components";
import { ProgressChart } from "@/components/ProgressChart";
import { ChatFAB } from "@/components/ChatFAB";
import { toast } from "@/hooks/use-toast";
import { AICoachBanner } from "@/components/AICoachBanner";
import { WeeklyAnalytics } from "@/components/WeeklyAnalytics";
import { ProgressMetricCard } from "@/components/ProgressMetricCard";
import { 
  Activity, 
  Weight, 
  Dumbbell,
  ArrowUp,
  ArrowDown,
  Minus,
  Calendar,
  Target,
  TrendingUp,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Mock data - in real implementation this would come from ProgressService
const aiInsights = [
  {
    type: 'achievement' as const,
    title: 'Weight Goal',
    message: 'You\'ve lost 3.2kg this month while maintaining muscle mass - excellent progress!',
    action: 'View details'
  },
  {
    type: 'suggestion' as const,
    title: 'Consistency',
    message: 'Try scheduling workouts on Sunday evenings to improve weekly completion rates.',
    action: 'Add to calendar'
  }
];

const weeklyStats = {
  workoutCompletion: 85,
  nutritionCompliance: 78,
  habitsCompleted: 12,
  totalHabits: 15,
  progressTrend: 'up' as const,
  weeklyGoals: {
    workouts: { completed: 4, target: 5 },
    calories: { avg: 2350, target: 2400 },
    protein: { avg: 182, target: 180 }
  }
};

const badges = [
  { id: 1, name: 'First 10 Workouts', earned: true, icon: '🏋️' },
  { id: 2, name: '30-Day Streak', earned: true, icon: '🔥' },
  { id: 3, name: '5kg Lost', earned: false, icon: '⚖️' },
  { id: 4, name: 'AI Plan Master', earned: true, icon: '🤖' },
  { id: 5, name: 'Consistency King', earned: false, icon: '👑' }
];

const goals = [
  { name: 'Target Weight', current: 79.3, target: 75, unit: 'kg', progress: 68 },
  { name: 'Bench Press', current: 85, target: 100, unit: 'kg', progress: 85 },
  { name: 'Workout Streak', current: 12, target: 30, unit: 'days', progress: 40 }
];

const strengthData = [
  { exercise: "Bench Press", previous: "80kg x 8", current: "85kg x 8", change: "up" },
  { exercise: "Squat", previous: "120kg x 5", current: "125kg x 5", change: "up" },
  { exercise: "Deadlift", previous: "140kg x 3", current: "140kg x 4", change: "up" },
  { exercise: "Shoulder Press", previous: "50kg x 8", current: "50kg x 8", change: "neutral" },
  { exercise: "Pull-ups", previous: "BW x 10", current: "BW x 12", change: "up" }
];

const measurementsData = [
  { part: "Chest", previous: "98cm", current: "100cm", change: "up" },
  { part: "Waist", previous: "84cm", current: "82cm", change: "down" },
  { part: "Arms", previous: "36cm", current: "37cm", change: "up" },
  { part: "Thighs", previous: "60cm", current: "62cm", change: "up" },
  { part: "Weight", previous: "82kg", current: "80kg", change: "down" }
];

export default function ProgressPage() {
  const { isAuthenticated, userId } = useAuth();
  const [timeRange, setTimeRange] = useState("week");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'weight' | 'waist' | 'chest' | 'arms' | 'hips'>('weight');
  const [showAIInsights, setShowAIInsights] = useState(true);

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
  
  const [showMultiMetric, setShowMultiMetric] = useState(false);
  
  const fetchProgressData = async (range: string) => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
      } else {
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

  const handleOptimizeWeek = () => {
    toast({
      title: "AI Analysis",
      description: "Analyzing your progress patterns...",
    });
  };

  const handleDismissInsight = (index: number) => {
    // In real implementation, update the insights state
    console.log("Dismissing insight:", index);
  };

  const handleExplainTrends = () => {
    toast({
      title: "AI Coach",
      description: "Opening detailed trend analysis...",
    });
  };

  const getSingleMetricData = () => {
    return multiMetricData.map(item => ({
      date: item.date,
      value: item[selectedMetric === 'weight' ? 'weight' : selectedMetric === 'waist' ? 'calories' : selectedMetric === 'chest' ? 'protein' : selectedMetric === 'arms' ? 'carbs' : 'fat']
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
        <div className="max-w-lg mx-auto space-y-6">
          <SectionTitle 
            title="Progress" 
            subtitle="Your fitness journey insights" 
          />

          {/* AI Coach Insights */}
          {showAIInsights && (
            <AICoachBanner
              insights={aiInsights}
              onOptimizeWeek={handleOptimizeWeek}
              onDismissInsight={handleDismissInsight}
              className="animate-fade-in"
            />
          )}

          {/* Weekly Analytics Summary */}
          <WeeklyAnalytics stats={weeklyStats} className="animate-fade-in" />

          {/* Achievement Badges */}
          <AnimatedCard delay={100}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-hashim-600" />
                <h3 className="font-semibold">Achievements</h3>
              </div>
              <Button variant="ghost" size="sm" className="text-hashim-600">
                View All
              </Button>
            </div>
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`flex-shrink-0 text-center p-3 rounded-xl border transition-all ${
                    badge.earned 
                      ? 'bg-gradient-to-br from-hashim-50 to-purple-50 border-hashim-200 scale-105' 
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="text-2xl mb-1">{badge.icon}</div>
                  <p className="text-xs font-medium">{badge.name}</p>
                </div>
              ))}
            </div>
          </AnimatedCard>

          {/* Goals Tracker */}
          <AnimatedCard delay={150}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-hashim-600" />
                <h3 className="font-semibold">Goals</h3>
              </div>
              <Button variant="ghost" size="sm" className="text-hashim-600">
                Set Goal
              </Button>
            </div>
            <div className="space-y-4">
              {goals.map((goal, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{goal.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {goal.current}/{goal.target} {goal.unit}
                    </span>
                  </div>
                  <Progress value={goal.progress} className="h-3" />
                </div>
              ))}
            </div>
          </AnimatedCard>

          {/* Time Range Selector */}
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
          </div>

          {/* Weight & Body Metrics Chart */}
          <AnimatedCard delay={200}>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <Weight className="h-5 w-5 text-hashim-600" />
                <h3 className="font-semibold">Body Metrics</h3>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleExplainTrends}
                  className="text-hashim-600"
                >
                  Explain Trends
                </Button>
              </div>
            </div>
            
            <div className="flex space-x-2 mb-4 overflow-x-auto">
              {(['weight', 'waist', 'chest', 'arms', 'hips'] as const).map((metric) => (
                <Button
                  key={metric}
                  size="sm"
                  variant={selectedMetric === metric ? "default" : "outline"}
                  onClick={() => setSelectedMetric(metric)}
                  className="capitalize flex-shrink-0"
                >
                  {metric}
                </Button>
              ))}
            </div>
            
            <div className="h-48 overflow-hidden">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hashim-600"></div>
                </div>
              ) : (
                <ProgressChart 
                  data={getSingleMetricData()} 
                  singleMetric={selectedMetric === 'weight' ? 'weight' : 'calories'} 
                />
              )}
            </div>
            
            <div className="mt-4 p-3 bg-hashim-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Weekly Trend</span>
                <div className="flex items-center space-x-1">
                  <TrendingDown className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-600">-0.5kg/week</span>
                </div>
              </div>
            </div>
          </AnimatedCard>
          
          {/* Exercise Progress */}
          <AnimatedCard delay={250}>
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
          
          {/* Body Measurements */}
          <AnimatedCard delay={300}>
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
