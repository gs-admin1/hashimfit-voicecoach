import { useState } from "react";
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
import { VoiceInput } from "./VoiceInput";
import { MealCaptureCard } from "./MealCaptureCard";
import { UserStatsModal } from "./UserStatsModal";
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
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = new Date();
  const currentDay = weekDays[today.getDay() === 0 ? 6 : today.getDay() - 1];
  const [selectedDay, setSelectedDay] = useState(currentDay);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [isProgressOpen, setIsProgressOpen] = useState(true);
  const [isNutritionOpen, setIsNutritionOpen] = useState(true);

  // Mock workouts for different days
  const workoutsByDay = {
    Mon: {
      title: "Upper Body Strength",
      exercises: [
        { name: "Bench Press", sets: 4, reps: "8-10", weight: "70kg" },
        { name: "Incline Dumbbell Press", sets: 4, reps: "10-12", weight: "25kg" },
        { name: "Lat Pulldown", sets: 4, reps: "12-15", weight: "60kg" },
        { name: "Cable Row", sets: 3, reps: "10-12", weight: "55kg" },
        { name: "Shoulder Press", sets: 3, reps: "10-12", weight: "20kg" },
      ],
    },
    Tue: {
      title: "Lower Body Focus",
      exercises: [
        { name: "Squats", sets: 5, reps: "6-8", weight: "100kg" },
        { name: "Romanian Deadlift", sets: 4, reps: "8-10", weight: "80kg" },
        { name: "Leg Press", sets: 3, reps: "10-12", weight: "150kg" },
        { name: "Leg Extensions", sets: 3, reps: "12-15", weight: "40kg" },
        { name: "Calf Raises", sets: 4, reps: "15-20", weight: "60kg" },
      ],
    },
    Wed: {
      title: "Rest & Recovery",
      exercises: [
        { name: "Stretching", sets: 1, reps: "10-15 mins", weight: "bodyweight" },
        { name: "Foam Rolling", sets: 1, reps: "10 mins", weight: "bodyweight" },
        { name: "Light Walking", sets: 1, reps: "20-30 mins", weight: "bodyweight" },
      ],
    },
    Thu: {
      title: "Push Workout",
      exercises: [
        { name: "Overhead Press", sets: 4, reps: "8-10", weight: "45kg" },
        { name: "Dips", sets: 4, reps: "10-12", weight: "bodyweight" },
        { name: "Incline Bench Press", sets: 3, reps: "8-10", weight: "60kg" },
        { name: "Lateral Raises", sets: 3, reps: "12-15", weight: "12kg" },
        { name: "Tricep Pushdowns", sets: 3, reps: "12-15", weight: "25kg" },
      ],
    },
    Fri: {
      title: "Pull Workout",
      exercises: [
        { name: "Pull-Ups", sets: 4, reps: "8-10", weight: "bodyweight" },
        { name: "Barbell Rows", sets: 4, reps: "10-12", weight: "70kg" },
        { name: "Face Pulls", sets: 3, reps: "15-20", weight: "25kg" },
        { name: "Hammer Curls", sets: 3, reps: "10-12", weight: "15kg" },
        { name: "Barbell Curls", sets: 3, reps: "10-12", weight: "30kg" },
      ],
    },
    Sat: {
      title: "Legs & Core",
      exercises: [
        { name: "Front Squats", sets: 4, reps: "8-10", weight: "80kg" },
        { name: "Lunges", sets: 3, reps: "10 each leg", weight: "20kg" },
        { name: "Leg Curls", sets: 3, reps: "12-15", weight: "35kg" },
        { name: "Plank", sets: 3, reps: "60 seconds", weight: "bodyweight" },
        { name: "Russian Twists", sets: 3, reps: "20 each side", weight: "10kg" },
      ],
    },
    Sun: {
      title: "Active Recovery",
      exercises: [
        { name: "Swimming", sets: 1, reps: "30 mins", weight: "bodyweight" },
        { name: "Yoga", sets: 1, reps: "30 mins", weight: "bodyweight" },
        { name: "Mobility Work", sets: 1, reps: "15 mins", weight: "bodyweight" },
      ],
    },
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
            subtitle={workoutsByDay[selectedDay as keyof typeof workoutsByDay]?.title || "Rest Day"}
          />
          <Button variant="ghost" size="sm" className="flex items-center">
            <span className="mr-1">View all</span>
            <ChevronRight size={16} />
          </Button>
        </div>
        
        <WorkoutCard workout={workoutsByDay[selectedDay as keyof typeof workoutsByDay]} />
      </div>

      <Collapsible
        open={isProgressOpen}
        onOpenChange={setIsProgressOpen}
        className="mb-8"
      >
        <div className="flex justify-between items-center">
          <SectionTitle
            title="Progress"
            subtitle="Last 4 weeks"
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
            <ProgressChart />
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
        </CollapsibleContent>
      </Collapsible>
      
      <UserStatsModal 
        isOpen={showStatsModal} 
        onClose={() => setShowStatsModal(false)} 
      />
    </div>
  );
}
