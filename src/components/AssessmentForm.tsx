
import { useState } from "react";
import { useUser, WorkoutFrequency } from "@/context/UserContext";
import { AssessmentService } from "@/lib/supabase/services/AssessmentService";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const assessmentSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  age: z.number().min(18, {
    message: "You must be at least 18 years old.",
  }),
  gender: z.enum(["male", "female", "other"]),
  height: z.number().min(100, {
    message: "Height must be at least 100 cm.",
  }),
  weight: z.number().min(30, {
    message: "Weight must be at least 30 kg.",
  }),
  fitnessGoal: z.enum(["muscle_gain", "weight_loss", "endurance", "sport_specific"]),
  workoutFrequency: z.number().min(1, {
    message: "Workout frequency must be at least 1 day per week.",
  }).max(7, {
    message: "Workout frequency must be at most 7 days per week.",
  }),
  targetWeight: z.number().optional(),
  diet: z.enum(["standard", "vegetarian", "vegan", "keto", "paleo", "gluten_free"]),
  equipment: z.enum(["full_gym", "home_gym", "minimal", "bodyweight_only"]),
  sportsPlayed: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
});

type AssessmentValues = z.infer<typeof assessmentSchema>;

export function AssessmentForm({ onComplete }: { onComplete: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateUser, completeAssessment } = useUser();
  const { userId } = useAuth();

  const form = useForm<AssessmentValues>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      name: "",
      age: 18,
      gender: "male",
      height: 170,
      weight: 70,
      fitnessGoal: "muscle_gain",
      workoutFrequency: 3,
      diet: "standard",
      equipment: "full_gym",
      sportsPlayed: [],
      allergies: [],
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = form.getValues();

    if (!form.formState.isValid) {
      toast({
        title: "Error",
        description: "Please fill out all required fields correctly.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // First complete the assessment in the user profile
      // Convert workoutFrequency to the correct type (WorkoutFrequency)
      const assessmentComplete = await completeAssessment({
        ...formData,
        workoutFrequency: formData.workoutFrequency as WorkoutFrequency
      });
      
      if (!assessmentComplete || !userId) {
        throw new Error("Failed to complete assessment");
      }
      
      // Then send the data for AI analysis
      const analysisResult = await AssessmentService.analyzeAssessment(userId, {
        age: formData.age,
        gender: formData.gender,
        height: formData.height,
        weight: formData.weight,
        fitnessGoal: formData.fitnessGoal,
        workoutFrequency: formData.workoutFrequency as WorkoutFrequency,
        diet: formData.diet,
        equipment: formData.equipment,
        sportsPlayed: formData.sportsPlayed,
        allergies: formData.allergies
      });
      
      if (!analysisResult) {
        toast({
          title: "Warning",
          description: "Assessment completed but there was an issue generating your plans. Please try again later.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success!",
          description: "Your personalized fitness and nutrition plans are ready!",
        });
      }
      
      // Complete the assessment flow regardless
      onComplete();
    } catch (error) {
      console.error("Error submitting assessment:", error);
      setError("There was an error submitting your assessment. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Your age"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="height"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Height (cm)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Your height in cm"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weight (kg)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Your weight in kg"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="fitnessGoal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fitness Goal</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a fitness goal" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                  <SelectItem value="weight_loss">Weight Loss</SelectItem>
                  <SelectItem value="endurance">Endurance</SelectItem>
                  <SelectItem value="sport_specific">Sport Specific</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="workoutFrequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Workout Frequency (days per week)</FormLabel>
              <FormControl>
                <Slider
                  defaultValue={[field.value]}
                  max={7}
                  min={1}
                  step={1}
                  onValueChange={(value) => field.onChange(value[0])}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="diet"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Diet</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a diet" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="vegan">Vegan</SelectItem>
                  <SelectItem value="keto">Keto</SelectItem>
                  <SelectItem value="paleo">Paleo</SelectItem>
                  <SelectItem value="gluten_free">Gluten Free</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="equipment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Available Equipment</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select available equipment" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="full_gym">Full Gym</SelectItem>
                  <SelectItem value="home_gym">Home Gym</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="bodyweight_only">Bodyweight Only</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sportsPlayed"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sports Played (optional)</FormLabel>
              <FormControl>
                <Input placeholder="List any sports you play" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="allergies"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Allergies (optional)</FormLabel>
              <FormControl>
                <Input placeholder="List any allergies you have" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && <p className="text-red-500">{error}</p>}

        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Submitting..." : "Submit Assessment"}
        </Button>
      </form>
    </Form>
  );
}
