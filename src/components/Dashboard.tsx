
import { useUser } from "@/context/UserContext";
import { 
  AnimatedCard, 
  StatsCard, 
  VoiceWidget, 
  SectionTitle,
  Chip
} from "./ui-components";
import { WorkoutCard } from "./WorkoutCard";
import { ProgressChart } from "./ProgressChart";
import { 
  Activity, 
  Weight, 
  Calendar, 
  ChevronRight, 
  Plus, 
  Dumbbell,
  ChartBar
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function Dashboard() {
  const { user } = useUser();
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = new Date();
  const currentDay = weekDays[today.getDay() === 0 ? 6 : today.getDay() - 1];

  // Mock data for today's workout
  const todaysWorkout = {
    title: "Upper Body Strength",
    exercises: [
      { name: "Bench Press", sets: 4, reps: "8-10", weight: "70kg" },
      { name: "Incline Dumbbell Press", sets: 4, reps: "10-12", weight: "25kg" },
      { name: "Lat Pulldown", sets: 4, reps: "12-15", weight: "60kg" },
      { name: "Cable Row", sets: 3, reps: "10-12", weight: "55kg" },
      { name: "Shoulder Press", sets: 3, reps: "10-12", weight: "20kg" },
    ],
  };

  // Mock nutrition data
  const nutritionPlan = {
    calories: 2400,
    protein: 180,
    carbs: 220,
    fat: 80,
    meals: [
      "Breakfast: Protein oats with berries",
      "Snack: Greek yogurt with nuts",
      "Lunch: Chicken breast with quinoa and vegetables",
      "Snack: Protein shake with banana",
      "Dinner: Salmon with sweet potatoes and broccoli"
    ]
  };

  return (
    <div className="max-w-lg mx-auto pb-20">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Welcome, {user?.name || "Athlete"}</h1>
        </div>
        
        <div className="flex space-x-3 mb-6 overflow-x-auto pb-2 scrollbar-none">
          {weekDays.map((day) => (
            <Chip 
              key={day} 
              label={day} 
              active={day === currentDay}
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

        <VoiceWidget />
      </div>

      <div className="mb-8">
        <SectionTitle
          title="Today's Workout"
          subtitle="Upper Body Focus"
          action={
            <Button variant="ghost" size="sm" className="flex items-center">
              <span className="mr-1">View all</span>
              <ChevronRight size={16} />
            </Button>
          }
        />
        
        <WorkoutCard workout={todaysWorkout} />
      </div>

      <div className="mb-8">
        <SectionTitle
          title="Progress"
          subtitle="Last 4 weeks"
        />
        
        <AnimatedCard className="overflow-hidden">
          <ProgressChart />
        </AnimatedCard>
      </div>

      <div className="mb-8">
        <SectionTitle
          title="Nutrition Plan"
          subtitle="Based on your goals"
          action={
            <Button variant="ghost" size="sm" className="flex items-center">
              <span className="mr-1">Adjust</span>
              <ChevronRight size={16} />
            </Button>
          }
        />
        
        <AnimatedCard>
          <div className="flex justify-between mb-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Calories</p>
              <p className="font-bold">{nutritionPlan.calories}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Protein</p>
              <p className="font-bold">{nutritionPlan.protein}g</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Carbs</p>
              <p className="font-bold">{nutritionPlan.carbs}g</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Fat</p>
              <p className="font-bold">{nutritionPlan.fat}g</p>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Today's Meal Plan</h4>
            <ul className="space-y-2">
              {nutritionPlan.meals.map((meal, index) => (
                <li key={index} className="text-sm flex">
                  <span className="text-hashim-600 mr-2">•</span>
                  {meal}
                </li>
              ))}
            </ul>
          </div>
        </AnimatedCard>
      </div>
    </div>
  );
}
