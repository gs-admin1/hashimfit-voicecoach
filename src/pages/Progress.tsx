
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
import { WeeklyReviewCard } from "@/components/WeeklyReviewCard";
import { WorkoutHeatmap } from "@/components/WorkoutHeatmap";
import { GoalTrackerCard } from "@/components/GoalTrackerCard";
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
  TrendingDown,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

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

  // Empty data for charts
  const [multiMetricData, setMultiMetricData] = useState([]);
  
  const [showMultiMetric, setShowMultiMetric] = useState(false);
  
  const fetchProgressData = async (range: string) => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Set empty data arrays based on range
      setMultiMetricData([]);
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
              insights={[]}
              onOptimizeWeek={handleOptimizeWeek}
              onDismissInsight={handleDismissInsight}
              className="animate-fade-in"
            />
          )}

          {/* Weekly Analytics Summary */}
          <WeeklyAnalytics stats={{
            workoutCompletion: 0,
            nutritionCompliance: 0,
            habitsCompleted: 0,
            totalHabits: 0,
            progressTrend: 'up' as const,
            weeklyGoals: {
              workouts: { completed: 0, target: 0 },
              calories: { avg: 0, target: 0 },
              protein: { avg: 0, target: 0 }
            }
          }} className="animate-fade-in" />

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
            <div className="text-center py-8 text-muted-foreground">
              <Award size={48} className="mx-auto mb-4 opacity-20" />
              <p>Complete workouts to unlock achievements!</p>
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
            <div className="text-center py-8 text-muted-foreground">
              <Target size={48} className="mx-auto mb-4 opacity-20" />
              <p>Set your fitness goals to track progress!</p>
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
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <Weight size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Start logging your measurements to see progress!</p>
                  </div>
                </div>
              )}
            </div>
          </AnimatedCard>
          
          {/* Exercise Progress */}
          <AnimatedCard delay={250}>
            <div className="flex items-center mb-4">
              <Dumbbell className="mr-2 text-hashim-600" size={20} />
              <h3 className="font-semibold">Exercise Progress</h3>
            </div>
            <div className="text-center py-8 text-muted-foreground">
              <Dumbbell size={48} className="mx-auto mb-4 opacity-20" />
              <p>Complete workouts to track your exercise progress!</p>
            </div>
          </AnimatedCard>
          
          {/* Body Measurements */}
          <AnimatedCard delay={300}>
            <div className="flex items-center mb-4">
              <Activity className="mr-2 text-hashim-600" size={20} />
              <h3 className="font-semibold">Body Measurements</h3>
            </div>
            <div className="text-center py-8 text-muted-foreground">
              <Activity size={48} className="mx-auto mb-4 opacity-20" />
              <p>Log your body measurements to track changes over time!</p>
            </div>
          </AnimatedCard>
        </div>
      </main>
      
      <NavigationBar />
      <ChatFAB />
    </div>
  );
}
