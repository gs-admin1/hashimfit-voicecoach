
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { NavigationBar, AnimatedCard, SectionTitle, Chip } from "@/components/ui-components";
import { WorkoutCard } from "@/components/WorkoutCard";
import { Button } from "@/components/ui/button";
import { AddWorkoutModal } from "@/components/AddWorkoutModal";
import { ChatFAB } from "@/components/ChatFAB";
import { Plus, Filter, ArrowUpDown } from "lucide-react";

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  weight: string;
}

interface Workout {
  title: string;
  exercises: Exercise[];
  category: string;
}

export default function WorkoutsPage() {
  const [filter, setFilter] = useState("all");
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  
  // Mock workout data
  const [workouts, setWorkouts] = useState<Workout[]>([
    {
      title: "Upper Body Strength",
      exercises: [
        { name: "Bench Press", sets: 4, reps: "8-10", weight: "70kg" },
        { name: "Incline Dumbbell Press", sets: 4, reps: "10-12", weight: "25kg" },
        { name: "Lat Pulldown", sets: 4, reps: "12-15", weight: "60kg" },
        { name: "Cable Row", sets: 3, reps: "10-12", weight: "55kg" },
        { name: "Shoulder Press", sets: 3, reps: "10-12", weight: "20kg" },
      ],
      category: "strength"
    },
    {
      title: "Lower Body Focus",
      exercises: [
        { name: "Squats", sets: 5, reps: "6-8", weight: "100kg" },
        { name: "Romanian Deadlift", sets: 4, reps: "8-10", weight: "80kg" },
        { name: "Leg Press", sets: 3, reps: "10-12", weight: "150kg" },
        { name: "Leg Extensions", sets: 3, reps: "12-15", weight: "40kg" },
        { name: "Calf Raises", sets: 4, reps: "15-20", weight: "60kg" },
      ],
      category: "strength"
    },
    {
      title: "HIIT Cardio",
      exercises: [
        { name: "Burpees", sets: 4, reps: "45 seconds", weight: "bodyweight" },
        { name: "Mountain Climbers", sets: 4, reps: "45 seconds", weight: "bodyweight" },
        { name: "Jump Squats", sets: 4, reps: "45 seconds", weight: "bodyweight" },
        { name: "High Knees", sets: 4, reps: "45 seconds", weight: "bodyweight" },
        { name: "Plank Jacks", sets: 4, reps: "45 seconds", weight: "bodyweight" },
      ],
      category: "cardio"
    },
    {
      title: "Mobility & Recovery",
      exercises: [
        { name: "Stretching", sets: 1, reps: "10-15 mins", weight: "bodyweight" },
        { name: "Foam Rolling", sets: 1, reps: "10 mins", weight: "bodyweight" },
        { name: "Light Walking", sets: 1, reps: "20-30 mins", weight: "bodyweight" },
      ],
      category: "recovery"
    },
  ]);
  
  const addWorkout = (workout: Workout) => {
    setWorkouts([...workouts, workout]);
  };

  const filteredWorkouts = filter === "all" 
    ? workouts 
    : workouts.filter(workout => workout.category === filter);

  return (
    <div className="min-h-screen bg-gradient-to-b from-hashim-50/50 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-border sticky top-0 z-10 animate-fade-in">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <Logo />
          <Button size="sm" variant="ghost" className="flex items-center">
            <Filter size={16} className="mr-2" />
            Filter
          </Button>
        </div>
      </header>
      
      <main className="pt-4 px-4 animate-fade-in pb-20">
        <div className="max-w-lg mx-auto">
          <SectionTitle 
            title="Workouts" 
            subtitle="Browse all workout programs" 
            action={
              <Button 
                size="sm" 
                className="flex items-center bg-hashim-600 hover:bg-hashim-700 text-white"
                onClick={() => setShowAddWorkout(true)}
              >
                <Plus size={16} className="mr-1" />
                Add
              </Button>
            }
          />
          
          <div className="flex space-x-3 mb-6 overflow-x-auto pb-2 scrollbar-none">
            <Chip 
              label="All" 
              active={filter === "all"}
              onClick={() => setFilter("all")}
            />
            <Chip 
              label="Strength" 
              active={filter === "strength"}
              onClick={() => setFilter("strength")}
            />
            <Chip 
              label="Cardio" 
              active={filter === "cardio"}
              onClick={() => setFilter("cardio")}
            />
            <Chip 
              label="Recovery" 
              active={filter === "recovery"}
              onClick={() => setFilter("recovery")}
            />
          </div>
          
          <div className="space-y-4">
            {filteredWorkouts.map((workout, index) => (
              <WorkoutCard key={index} workout={workout} />
            ))}
          </div>
        </div>
      </main>
      
      <AddWorkoutModal 
        isOpen={showAddWorkout} 
        onClose={() => setShowAddWorkout(false)}
        onAdd={addWorkout}
      />
      
      <NavigationBar />
      <ChatFAB />
    </div>
  );
}
