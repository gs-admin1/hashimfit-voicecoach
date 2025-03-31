
import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { useAuth } from "@/hooks/useAuth";
import { AssessmentService } from "@/lib/supabase/services/AssessmentService";
import { WorkoutService } from "@/lib/supabase/services/WorkoutService";
import { 
  AnimatedCard, 
  StatsCard, 
  VoiceWidget, 
  SectionTitle,
  Chip
} from "./ui-components";
import { WorkoutCard } from "./WorkoutCard";
import { ProgressChart } from "./ProgressChart";
import { VoiceInput } from "./VoiceInput";
import { MealCaptureCard } from "./MealCaptureCard";
import { UserStatsModal } from "./UserStatsModal";
import { AddWorkoutModal } from "./AddWorkoutModal";
import { toast } from "@/hooks/use-toast";
import { 
  Activity, 
  Weight, 
  Calendar, 
  ChevronRight, 
  Plus, 
  Dumbbell,
  ChartBar,
  ChevronDown,
  ChevronUp,
  BarChart2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

export function Dashboard() {
  const { user } = useUser();
  const { isAuthenticated, userId } = useAuth();
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showAddWorkoutModal, setShowAddWorkoutModal] = useState(false);
  const [isProgressOpen, setIsProgressOpen] = useState(true);
  const [isNutritionOpen, setIsNutritionOpen] = useState(true);
  
  // State for workouts and nutrition
  const [weeklyWorkouts, setWeeklyWorkouts] = useState<Record<string, any>>({});
  const [nutritionPlan, setNutritionPlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get today's day and create a 7-day array starting from today
  const today = new Date();
  const dayIndex = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const weekDaysDefault = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  // Reorder the days to start from today
  const weekDays = [...weekDaysDefault.slice(dayIndex), ...weekDaysDefault.slice(0, dayIndex)];
  
  // Selected day state (default to today)
  const [selectedDay, setSelectedDay] = useState(weekDaysDefault[dayIndex]);
  
  // Progress chart data with timeframe selection
  const [timeframe, setTimeframe] = useState<'week' | 'month' | '3months' | '6months' | 'year'>('week');
  
  // State for different progress data types
  const [progressData, setProgressData] = useState([
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
  
  const [proteinData, setProteinData] = useState([
    { date: "Day 1", value: 180 },
    { date: "Day 2", value: 175 },
    { date: "Day 3", value: 185 },
    { date: "Day 4", value: 178 },
    { date: "Day 5", value: 182 },
    { date: "Day 6", value: 180 },
    { date: "Day 7", value: 183 },
  ]);
  
  const [carbsData, setCarbsData] = useState([
    { date: "Day 1", value: 215 },
    { date: "Day 2", value: 215 },
    { date: "Day 3", value: 230 },
    { date: "Day 4", value: 210 },
    { date: "Day 5", value: 225 },
    { date: "Day 6", value: 218 },
    { date: "Day 7", value: 222 },
  ]);
  
  const [fatData, setFatData] = useState([
    { date: "Day 1", value: 80 },
    { date: "Day 2", value: 78 },
    { date: "Day 3", value: 82 },
    { date: "Day 4", value: 76 },
    { date: "Day 5", value: 80 },
    { date: "Day 6", value: 79 },
    { date: "Day 7", value: 81 },
  ]);
  
  // State for the selected metric to display in chart
  const [selectedMetric, setSelectedMetric] = useState<'weight' | 'calories' | 'protein' | 'carbs' | 'fat'>('weight');

  // Add multi-metric display state
  const [showMultiMetric, setShowMultiMetric] = useState(true);
  const [activeMetrics, setActiveMetrics] = useState({
    weight: true,
    calories: true,
    protein: true,
    carbs: true,
    fat: true
  });

  // Fetch data on component mount
  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchWorkoutsAndNutrition();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, userId]);
  
  const fetchWorkoutsAndNutrition = async () => {
    try {
      setIsLoading(true);
      
      // Fetch weekly workouts
      const workouts = await AssessmentService.getWeeklyWorkouts(userId!);
      setWeeklyWorkouts(workouts || {});
      
      // Fetch nutrition plan
      const nutrition = await AssessmentService.getCurrentNutritionPlan(userId!);
      setNutritionPlan(nutrition || {
        calories: 2400,
        protein: 180,
        carbs: 220,
        fat: 80,
        meals: [
          { title: "Breakfast: Protein oats with berries" },
          { title: "Snack: Greek yogurt with nuts" },
          { title: "Lunch: Chicken breast with quinoa and vegetables" },
          { title: "Snack: Protein shake with banana" },
          { title: "Dinner: Salmon with sweet potatoes and broccoli" }
        ]
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load your fitness data. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update progress data based on selected timeframe
  useEffect(() => {
    fetchProgressData(timeframe, selectedMetric);
  }, [timeframe, selectedMetric]);
  
  const fetchProgressData = (timeframe: string, metric: string) => {
    // In a real app, this would be an API call to fetch data based on timeframe and metric
    // For this implementation, we'll use the mock data already defined
    
    // Different date formats based on timeframe
    let dates: string[] = [];
    
    switch(timeframe) {
      case 'week':
        dates = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        break;
      case 'month':
        dates = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        break;
      case '3months':
        dates = ['Jan', 'Feb', 'Mar'];
        break;
      case '6months':
        dates = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        break;
      case 'year':
        dates = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        break;
    }
    
    // Get the appropriate data based on metric
    switch(metric) {
      case 'weight':
        // Current weight data is already in the right format
        break;
      case 'calories':
        setProgressData(caloriesData);
        break;
      case 'protein':
        setProgressData(proteinData);
        break;
      case 'carbs':
        setProgressData(carbsData);
        break;
      case 'fat':
        setProgressData(fatData);
        break;
    }
  };
  
  // Handler for exercise completion
  const handleExerciseCompletion = async (workoutId: string, scheduleId: string, exerciseId: string, isCompleted: boolean) => {
    // Update the UI state first for immediate feedback
    setWeeklyWorkouts(prevWorkouts => {
      const updatedWorkouts = { ...prevWorkouts };
      
      Object.keys(updatedWorkouts).forEach(day => {
        if (updatedWorkouts[day]?.id === workoutId) {
          updatedWorkouts[day].exercises = updatedWorkouts[day].exercises.map((ex: any) => 
            ex.id === exerciseId ? { ...ex, completed: isCompleted } : ex
          );
        }
      });
      
      return updatedWorkouts;
    });
    
    // In a real implementation, you would update this in the database
    // This would be implemented in WorkoutService
  };
  
  // Handler for adding a new exercise
  const handleAddExercise = async (workoutId: string, newExercise: any) => {
    try {
      // In a real implementation, you would add this exercise to the database
      // For now, just update the UI state
      setWeeklyWorkouts(prevWorkouts => {
        const updatedWorkouts = { ...prevWorkouts };
        
        Object.keys(updatedWorkouts).forEach(day => {
          if (updatedWorkouts[day]?.id === workoutId) {
            updatedWorkouts[day].exercises = [...updatedWorkouts[day].exercises, {
              ...newExercise,
              id: `temp-${Date.now()}`, // Temporary ID
              completed: false
            }];
          }
        });
        
        return updatedWorkouts;
      });
      
      toast({
        title: "Exercise added",
        description: `${newExercise.name} added to workout plan`
      });
    } catch (error) {
      console.error("Error adding exercise:", error);
      toast({
        title: "Error",
        description: "Failed to add exercise",
        variant: "destructive"
      });
    }
  };
  
  // Handler for removing an exercise
  const handleRemoveExercise = async (workoutId: string, exerciseId: string) => {
    try {
      // In a real implementation, you would remove this exercise from the database
      // For now, just update the UI state
      setWeeklyWorkouts(prevWorkouts => {
        const updatedWorkouts = { ...prevWorkouts };
        
        Object.keys(updatedWorkouts).forEach(day => {
          if (updatedWorkouts[day]?.id === workoutId) {
            updatedWorkouts[day].exercises = updatedWorkouts[day].exercises.filter(
              (ex: any) => ex.id !== exerciseId
            );
          }
        });
        
        return updatedWorkouts;
      });
      
      toast({
        title: "Exercise removed",
        description: "Exercise removed from workout plan"
      });
    } catch (error) {
      console.error("Error removing exercise:", error);
      toast({
        title: "Error",
        description: "Failed to remove exercise",
        variant: "destructive"
      });
    }
  };
  
  // Handler for adding a full workout
  const handleAddWorkout = async (workout: any) => {
    try {
      // In a real implementation, you would add this workout to the database
      // For now, just update the UI state
      setWeeklyWorkouts(prevWorkouts => {
        const updatedWorkouts = { ...prevWorkouts };
        
        // Add the workout to the selected day
        updatedWorkouts[selectedDay] = {
          id: `workout-${Date.now()}`,
          title: workout.title,
          category: workout.category,
          exercises: workout.exercises.map((ex: any, index: number) => ({
            ...ex,
            id: `ex-${Date.now()}-${index}`,
            completed: false
          }))
        };
        
        return updatedWorkouts;
      });
    } catch (error) {
      console.error("Error adding workout:", error);
      toast({
        title: "Error",
        description: "Failed to add workout",
        variant: "destructive"
      });
    }
  };

  const formatMultiMetricData = () => {
    switch(timeframe) {
      case 'week':
        return [
          { date: "Mon", weight: 80.8, calories: 2400, protein: 180, carbs: 215, fat: 80 },
          { date: "Tue", weight: 80.5, calories: 2350, protein: 175, carbs: 215, fat: 78 },
          { date: "Wed", weight: 80.3, calories: 2450, protein: 185, carbs: 230, fat: 82 },
          { date: "Thu", weight: 80.0, calories: 2300, protein: 178, carbs: 210, fat: 76 },
          { date: "Fri", weight: 79.8, calories: 2380, protein: 182, carbs: 225, fat: 80 },
          { date: "Sat", weight: 79.5, calories: 2420, protein: 180, carbs: 218, fat: 79 },
          { date: "Sun", weight: 79.3, calories: 2350, protein: 183, carbs: 222, fat: 81 },
        ];
      case 'month':
        return [
          { date: "Week 1", weight: 82, calories: 2400, protein: 180, carbs: 220, fat: 78 },
          { date: "Week 2", weight: 81.5, calories: 2380, protein: 178, carbs: 215, fat: 79 },
          { date: "Week 3", weight: 80.8, calories: 2420, protein: 182, carbs: 225, fat: 77 },
          { date: "Week 4", weight: 79.8, calories: 2350, protein: 185, carbs: 210, fat: 75 },
        ];
      case '3months':
        return [
          { date: "Jan", weight: 83, calories: 2450, protein: 175, carbs: 230, fat: 82 },
          { date: "Feb", weight: 82, calories: 2400, protein: 180, carbs: 220, fat: 80 },
          { date: "Mar", weight: 80.5, calories: 2350, protein: 185, carbs: 215, fat: 78 },
        ];
      case '6months':
        return [
          { date: "Jan", weight: 85, calories: 2500, protein: 170, carbs: 235, fat: 85 },
          { date: "Feb", weight: 84, calories: 2480, protein: 175, carbs: 230, fat: 83 },
          { date: "Mar", weight: 83, calories: 2450, protein: 175, carbs: 230, fat: 82 },
          { date: "Apr", weight: 82, calories: 2400, protein: 180, carbs: 220, fat: 80 },
          { date: "May", weight: 81, calories: 2380, protein: 182, carbs: 218, fat: 79 },
          { date: "Jun", weight: 80.5, calories: 2350, protein: 185, carbs: 215, fat: 78 },
        ];
      case 'year':
        return [
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
        ];
      default:
        return [
          { date: "Mon", weight: 80.8, calories: 2400, protein: 180, carbs: 215, fat: 80 },
          { date: "Tue", weight: 80.5, calories: 2350, protein: 175, carbs: 215, fat: 78 },
          { date: "Wed", weight: 80.3, calories: 2450, protein: 185, carbs: 230, fat: 82 },
          { date: "Thu", weight: 80.0, calories: 2300, protein: 178, carbs: 210, fat: 76 },
          { date: "Fri", weight: 79.8, calories: 2380, protein: 182, carbs: 225, fat: 80 },
          { date: "Sat", weight: 79.5, calories: 2420, protein: 180, carbs: 218, fat: 79 },
          { date: "Sun", weight: 79.3, calories: 2350, protein: 183, carbs: 222, fat: 81 },
        ];
    }
  };

  const toggleMetric = (metric: keyof typeof activeMetrics) => {
    setActiveMetrics(prev => ({
      ...prev,
      [metric]: !prev[metric]
    }));
  };

  const getChartData = () => {
    switch (selectedMetric) {
      case "weight":
        return progressData;
      case "calories":
        return caloriesData;
      case "protein":
        return proteinData;
      case "carbs":
        return carbsData;
      case "fat":
        return fatData;
      default:
        return progressData;
    }
  };

  return (
    <div className="max-w-lg mx-auto pb-20">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Welcome, {user?.name || "Athlete"}</h1>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowStatsModal(true)}
            className="flex items-center border-hashim-300 text-hashim-700 hover:bg-hashim-50"
          >
            <BarChart2 size={16} className="mr-1" />
            Stats
          </Button>
        </div>
        
        <div className="flex space-x-3 mb-6 overflow-x-auto pb-2 scrollbar-none">
          {weekDays.map((day) => (
            <Chip 
              key={day} 
              label={day} 
              active={day === selectedDay}
              onClick={() => setSelectedDay(day)}
            />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <StatsCard
            title="Weight"
            value={`${user?.weight || 75}kg`}
            icon={Weight}
            trend="down"
            trendValue="-2.1kg"
          />
          <StatsCard
            title="Workouts"
            value="16"
            icon={Activity}
            trend="up"
            trendValue="+3"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <VoiceInput />
          <MealCaptureCard />
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center">
          <SectionTitle
            title={`${selectedDay}'s Workout`}
            subtitle={weeklyWorkouts[selectedDay]?.title || "Rest Day"}
          />
          <Button variant="ghost" size="sm" className="flex items-center">
            <span className="mr-1">View all</span>
            <ChevronRight size={16} />
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hashim-600"></div>
          </div>
        ) : (
          weeklyWorkouts[selectedDay] ? (
            <WorkoutCard 
              workout={weeklyWorkouts[selectedDay]} 
              onExerciseComplete={(exerciseId, isCompleted) => 
                handleExerciseCompletion(
                  weeklyWorkouts[selectedDay].id, 
                  weeklyWorkouts[selectedDay].schedule_id,
                  exerciseId, 
                  isCompleted
                )
              }
              onAddExercise={(exercise) => handleAddExercise(weeklyWorkouts[selectedDay].id, exercise)}
              onRemoveExercise={(exerciseId) => handleRemoveExercise(weeklyWorkouts[selectedDay].id, exerciseId)}
              editable={true}
            />
          ) : (
            <AnimatedCard className="text-center py-8">
              <p className="text-muted-foreground mb-4">No workout scheduled for {selectedDay}</p>
              <Button 
                variant="outline" 
                className="flex items-center mx-auto"
                onClick={() => setShowAddWorkoutModal(true)}
              >
                <Plus size={16} className="mr-1" />
                Add a workout
              </Button>
            </AnimatedCard>
          )
        )}
      </div>

      <Collapsible
        open={isProgressOpen}
        onOpenChange={setIsProgressOpen}
        className="mb-8"
      >
        <div className="flex justify-between items-center">
          <SectionTitle
            title="Progress"
            subtitle="Track your fitness journey"
          />
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center">
              {isProgressOpen ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </Button>
          </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent>
          <AnimatedCard className="overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-1">
                <Button 
                  size="sm"
                  variant={showMultiMetric ? "default" : "outline"}
                  onClick={() => setShowMultiMetric(true)}
                >
                  Multi
                </Button>
                <Button 
                  size="sm"
                  variant={!showMultiMetric ? "default" : "outline"}
                  onClick={() => setShowMultiMetric(false)}
                >
                  Single
                </Button>
              </div>
              
              {!showMultiMetric && (
                <div className="flex space-x-1">
                  <Button 
                    size="sm" 
                    variant={selectedMetric === "weight" ? "default" : "outline"}
                    onClick={() => setSelectedMetric("weight")}
                  >
                    Weight
                  </Button>
                  <Button 
                    size="sm" 
                    variant={selectedMetric === "calories" ? "default" : "outline"}
                    onClick={() => setSelectedMetric("calories")}
                  >
                    Cal
                  </Button>
                  <Button 
                    size="sm" 
                    variant={selectedMetric === "protein" ? "default" : "outline"}
                    onClick={() => setSelectedMetric("protein")}
                  >
                    Prot
                  </Button>
                </div>
              )}
            </div>
            
            {showMultiMetric && (
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="flex items-center space-x-1 mr-2">
                  <input 
                    type="checkbox" 
                    id="weight-toggle-dash" 
                    checked={activeMetrics.weight}
                    onChange={() => toggleMetric('weight')}
                    className="rounded text-hashim-600"
                  />
                  <label htmlFor="weight-toggle-dash" className="text-sm flex items-center">
                    <span className="inline-block w-2 h-2 mr-1 rounded-full" style={{ backgroundColor: '#be123c' }}></span>
                    Wt
                  </label>
                </div>
                
                <div className="flex items-center space-x-1 mr-2">
                  <input 
                    type="checkbox" 
                    id="calories-toggle-dash" 
                    checked={activeMetrics.calories}
                    onChange={() => toggleMetric('calories')}
                    className="rounded text-hashim-600"
                  />
                  <label htmlFor="calories-toggle-dash" className="text-sm flex items-center">
                    <span className="inline-block w-2 h-2 mr-1 rounded-full" style={{ backgroundColor: '#0891b2' }}></span>
                    Cal
                  </label>
                </div>
                
                <div className="flex items-center space-x-1 mr-2">
                  <input 
                    type="checkbox" 
                    id="protein-toggle-dash" 
                    checked={activeMetrics.protein}
                    onChange={() => toggleMetric('protein')}
                    className="rounded text-hashim-600"
                  />
                  <label htmlFor="protein-toggle-dash" className="text-sm flex items-center">
                    <span className="inline-block w-2 h-2 mr-1 rounded-full" style={{ backgroundColor: '#4d7c0f' }}></span>
                    Pro
                  </label>
                </div>
                
                <div className="flex items-center space-x-1 mr-2">
                  <input 
                    type="checkbox" 
                    id="carbs-toggle-dash" 
                    checked={activeMetrics.carbs}
                    onChange={() => toggleMetric('carbs')}
                    className="rounded text-hashim-600"
                  />
                  <label htmlFor="carbs-toggle-dash" className="text-sm flex items-center">
                    <span className="inline-block w-2 h-2 mr-1 rounded-full" style={{ backgroundColor: '#b45309' }}></span>
                    Carb
                  </label>
                </div>
                
                <div className="flex items-center space-x-1">
                  <input 
                    type="checkbox" 
                    id="fat-toggle-dash" 
                    checked={activeMetrics.fat}
                    onChange={() => toggleMetric('fat')}
                    className="rounded text-hashim-600"
                  />
                  <label htmlFor="fat-toggle-dash" className="text-sm flex items-center">
                    <span className="inline-block w-2 h-2 mr-1 rounded-full" style={{ backgroundColor: '#7c3aed' }}></span>
                    Fat
                  </label>
                </div>
              </div>
            )}
            
            <div className="flex flex-wrap gap-1 mb-4">
              <Button 
                size="sm" 
                variant={timeframe === "week" ? "default" : "outline"}
                onClick={() => setTimeframe("week")}
                className="text-xs py-1 h-7"
              >
                Week
              </Button>
              <Button 
                size="sm" 
                variant={timeframe === "month" ? "default" : "outline"}
                onClick={() => setTimeframe("month")}
                className="text-xs py-1 h-7"
              >
                Month
              </Button>
              <Button 
                size="sm" 
                variant={timeframe === "3months" ? "default" : "outline"}
                onClick={() => setTimeframe("3months")}
                className="text-xs py-1 h-7"
              >
                3 Mo
              </Button>
              <Button 
                size="sm" 
                variant={timeframe === "6months" ? "default" : "outline"}
                onClick={() => setTimeframe("6months")}
                className="text-xs py-1 h-7"
              >
                6 Mo
              </Button>
              <Button 
                size="sm" 
                variant={timeframe === "year" ? "default" : "outline"}
                onClick={() => setTimeframe("year")}
                className="text-xs py-1 h-7"
              >
                Year
              </Button>
            </div>
            
            {showMultiMetric ? (
              <ProgressChart 
                data={formatMultiMetricData()} 
                metrics={activeMetrics} 
              />
            ) : (
              <ProgressChart 
                data={getChartData()} 
                singleMetric={selectedMetric} 
              />
            )}
          </AnimatedCard>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible
        open={isNutritionOpen}
        onOpenChange={setIsNutritionOpen}
        className="mb-8"
      >
        <div className="flex justify-between items-center">
          <SectionTitle
            title="Nutrition Plan"
            subtitle="Based on your goals"
          />
          <div className="flex items-center">
            <Button variant="ghost" size="sm" className="flex items-center mr-2">
              <span className="mr-1">Adjust</span>
              <ChevronRight size={16} />
            </Button>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center">
                {isNutritionOpen ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>
        
        <CollapsibleContent>
          <AnimatedCard>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hashim-600"></div>
              </div>
            ) : (
              <>
                <div className="flex justify-between mb-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Calories</p>
                    <p className="font-bold">{nutritionPlan?.calories || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Protein</p>
                    <p className="font-bold">{nutritionPlan?.protein || 0}g</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Carbs</p>
                    <p className="font-bold">{nutritionPlan?.carbs || 0}g</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Fat</p>
                    <p className="font-bold">{nutritionPlan?.fat || 0}g</p>
                  </div>
                </div>
                
                <div className="space-y-3 mt-6">
                  {nutritionPlan?.meals?.map((meal: any, index: number) => (
                    <div key={`meal-${index}`} className="bg-muted p-3 rounded-lg">
                      <p className="font-medium">{meal.title}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </AnimatedCard>
        </CollapsibleContent>
      </Collapsible>
      
      {/* Modals */}
      {showStatsModal && (
        <UserStatsModal 
          isOpen={showStatsModal} 
          onClose={() => setShowStatsModal(false)} 
        />
      )}
      
      {showAddWorkoutModal && (
        <AddWorkoutModal 
          isOpen={showAddWorkoutModal} 
          onClose={() => setShowAddWorkoutModal(false)}
          onAddWorkout={handleAddWorkout}
          selectedDay={selectedDay}
        />
      )}
    </div>
  );
}
