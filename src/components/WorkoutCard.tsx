
import { useState } from "react";
import { AnimatedCard } from "./ui-components";
import { CheckCircle, Circle, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  weight: string;
  completed?: boolean;
}

interface WorkoutCardProps {
  workout: {
    title: string;
    exercises: Exercise[];
  };
}

export function WorkoutCard({ workout }: WorkoutCardProps) {
  const [expanded, setExpanded] = useState(true);
  const [exercises, setExercises] = useState(workout.exercises);

  const toggleExerciseCompletion = (index: number) => {
    const updatedExercises = [...exercises];
    updatedExercises[index] = {
      ...updatedExercises[index],
      completed: !updatedExercises[index].completed,
    };
    setExercises(updatedExercises);
  };

  const completedCount = exercises.filter((ex) => ex.completed).length;
  const progress = (completedCount / exercises.length) * 100;

  return (
    <AnimatedCard>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-bold text-lg">{workout.title}</h3>
          <p className="text-sm text-muted-foreground">
            {exercises.length} exercises • {completedCount} completed
          </p>
        </div>
        <button 
          onClick={() => setExpanded(!expanded)}
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          {expanded ? (
            <ChevronUp size={20} />
          ) : (
            <ChevronDown size={20} />
          )}
        </button>
      </div>

      <div className="w-full h-2 bg-muted rounded-full mb-4">
        <div 
          className="h-full bg-hashim-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {expanded && (
        <div className="space-y-3 mt-6">
          {exercises.map((exercise, index) => (
            <div 
              key={index}
              className={cn(
                "flex items-center p-3 rounded-xl transition-all duration-300",
                exercise.completed ? "bg-hashim-50 dark:bg-hashim-900/20" : ""
              )}
            >
              <button
                onClick={() => toggleExerciseCompletion(index)}
                className={cn(
                  "p-1 rounded-full mr-3 transition-colors",
                  exercise.completed ? "text-hashim-600" : "text-muted-foreground"
                )}
              >
                {exercise.completed ? (
                  <CheckCircle size={20} className="animate-scale-in" />
                ) : (
                  <Circle size={20} />
                )}
              </button>
              <div className="flex-1">
                <p className="font-medium">{exercise.name}</p>
                <p className="text-sm text-muted-foreground">
                  {exercise.sets} sets • {exercise.reps} reps • {exercise.weight}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </AnimatedCard>
  );
}
