
import supabase from '@/lib/supabase';
import { WorkoutPlan, WorkoutExercise, WorkoutService } from './WorkoutService';
import { NutritionPlan, MealPlan, NutritionService } from './NutritionService';
import { analyzeFitnessAssessment } from '../edge-functions/analyze-fitness-assessment';

// Define interfaces for API request and response
export interface FitnessAssessmentData {
  age: number;
  gender: string;
  height: number;
  weight: number;
  fitnessGoal: string;
  workoutFrequency: number;
  diet: string;
  equipment: string;
  sportsPlayed?: string[];
  allergies?: string[];
  existingConditions?: string[];
  fitnessLevel?: string;
  previousExperience?: string;
}

// Interfaces for the AI analysis response
interface WorkoutExerciseAnalysis {
  name: string;
  sets: number;
  reps: string;
  weight: string;
  rest_time?: number;
  notes?: string;
}

interface DailyWorkoutPlan {
  day: string;
  title: string;
  description: string;
  category: 'strength' | 'cardio' | 'hiit' | 'recovery' | 'sport_specific' | 'custom';
  exercises: WorkoutExerciseAnalysis[];
}

interface MealPlanAnalysis {
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  meal_title: string;
  description?: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

interface NutritionPlanAnalysis {
  daily_calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  diet_type: 'standard' | 'vegetarian' | 'vegan' | 'keto' | 'paleo' | 'gluten_free';
  meals: MealPlanAnalysis[];
}

export interface AIAnalysisResponse {
  workout_plans: DailyWorkoutPlan[];
  nutrition_plan: NutritionPlanAnalysis;
  recommendations: string[];
}

export class AssessmentService {
  static async analyzeAssessment(userId: string, formData: any): Promise<boolean> {
    try {
      console.log("Analyzing assessment for user:", userId);
      
      // Transform form data to match the required FitnessAssessmentData structure
      const assessmentData: FitnessAssessmentData = {
        age: formData.age,
        gender: formData.gender,
        height: formData.height,
        weight: formData.weight,
        fitnessGoal: formData.fitnessGoal,
        workoutFrequency: formData.workoutFrequency,
        diet: formData.diet,
        equipment: formData.equipment,
        sportsPlayed: formData.sportsPlayed || [],
        allergies: formData.allergies || []
      };
      
      console.log("Formatted assessment data:", assessmentData);
      
      // Save the assessment data to the assessment_data table
      try {
        const { error: saveError } = await supabase
          .from('assessment_data')
          .insert({
            user_id: userId,
            age: assessmentData.age,
            gender: assessmentData.gender,
            height: assessmentData.height,
            weight: assessmentData.weight,
            fitness_goal: assessmentData.fitnessGoal,
            workout_frequency: assessmentData.workoutFrequency,
            diet: assessmentData.diet,
            equipment: assessmentData.equipment,
            sports_played: assessmentData.sportsPlayed,
            allergies: assessmentData.allergies,
            existing_conditions: assessmentData.existingConditions || [],
            fitness_level: assessmentData.fitnessLevel || null,
            previous_experience: assessmentData.previousExperience || null
          });
          
        if (saveError) {
          console.error("Error saving assessment data:", saveError);
          // Continue with analysis even if saving fails
        } else {
          console.log("Assessment data saved successfully");
          
          // Update the profile to mark assessment as completed
          await supabase
            .from('profiles')
            .update({ has_completed_assessment: true })
            .eq('id', userId);
        }
      } catch (saveError) {
        console.error("Exception saving assessment data:", saveError);
        // Continue with analysis even if saving fails
      }
      
      // Call the edge function to analyze the assessment data
      const analysisResponse = await analyzeFitnessAssessment({
        user_id: userId,
        assessment: assessmentData
      });
      
      if (!analysisResponse) {
        console.error("No response from assessment analysis function");
        throw new Error('No response from assessment analysis function');
      }
      
      console.log("Received analysis response:", JSON.stringify(analysisResponse, null, 2));
      
      // Process and store the workout plans
      await this.processAndStoreWorkoutPlans(userId, analysisResponse.workout_plans);
      
      // Process and store the nutrition plan
      await this.processAndStoreNutritionPlan(userId, analysisResponse.nutrition_plan);
      
      // Store recommendations if available
      if (analysisResponse.recommendations && analysisResponse.recommendations.length > 0) {
        try {
          const { error } = await supabase
            .from('user_recommendations')
            .insert({
              user_id: userId,
              recommendations: analysisResponse.recommendations,
              source: 'ai_assessment',
              created_at: new Date().toISOString()
            });
            
          if (error) {
            console.error("Error storing recommendations:", error);
          }
        } catch (err) {
          console.error("Error saving recommendations:", err);
          // Continue even if recommendations fail to save
        }
      }

      return true;
    } catch (error) {
      console.error('Error in fitness assessment analysis:', error);
      return false;
    }
  }

  // Helper methods for processing workout plans and exercises
  private static async processAndStoreWorkoutPlans(userId: string, workoutPlans: DailyWorkoutPlan[]): Promise<void> {
    console.log("Processing workout plans:", workoutPlans.length);
    // Map day names to day indices (0 = Sunday, 1 = Monday, etc.)
    const dayMapping: Record<string, number> = {
      'Sunday': 0, 'Sun': 0,
      'Monday': 1, 'Mon': 1,
      'Tuesday': 2, 'Tue': 2,
      'Wednesday': 3, 'Wed': 3,
      'Thursday': 4, 'Thu': 4,
      'Friday': 5, 'Fri': 5,
      'Saturday': 6, 'Sat': 6
    };

    // First, clean up any existing AI-generated workout plans to avoid duplicates
    try {
      const { data: existingPlans } = await supabase
        .from('workout_plans')
        .select('id')
        .eq('user_id', userId)
        .eq('ai_generated', true);
        
      if (existingPlans && existingPlans.length > 0) {
        const planIds = existingPlans.map(plan => plan.id);
        
        // Delete associated exercises first
        await supabase
          .from('workout_exercises')
          .delete()
          .in('workout_plan_id', planIds);
          
        // Delete scheduled workouts
        await supabase
          .from('workout_schedule')
          .delete()
          .in('workout_plan_id', planIds);
          
        // Then delete the plans
        await supabase
          .from('workout_plans')
          .delete()
          .in('id', planIds);
      }
    } catch (error) {
      console.error("Error cleaning up existing workout plans:", error);
    }

    // Process each daily workout plan
    for (const plan of workoutPlans) {
      try {
        console.log(`Processing workout plan for ${plan.day}: ${plan.title}`);
        
        // Make sure the category is one of the allowed values
        const validCategories = ['strength', 'cardio', 'hiit', 'recovery', 'sport_specific', 'custom'];
        const category = validCategories.includes(plan.category) ? plan.category : 'custom';
        
        // Create a workout plan
        const workoutPlan: WorkoutPlan = {
          user_id: userId,
          title: `${plan.day}'s ${plan.title}`,
          description: plan.description,
          category: category,
          difficulty: 3,  // Default difficulty
          estimated_duration: 60,  // Default duration in minutes
          target_muscles: plan.exercises.map(ex => ex.name.split(' ')[0]),  // Extract muscle groups
          ai_generated: true
        };

        const createdPlan = await WorkoutService.createWorkoutPlan(workoutPlan);
        
        if (!createdPlan || !createdPlan.id) {
          console.error('Failed to create workout plan');
          continue;
        }

        // Create exercises for the plan - ensure required fields are present
        const exercises: WorkoutExercise[] = plan.exercises.map((ex, index) => {
          // Ensure all required fields have values
          return {
            workout_plan_id: createdPlan.id!,
            name: ex.name,
            sets: ex.sets ?? 3, // Default to 3 sets if not provided
            reps: ex.reps ?? '10', // Default to 10 reps if not provided
            weight: ex.weight ?? 'bodyweight',
            rest_time: ex.rest_time ?? 60, // Default to 60 seconds rest
            notes: ex.notes ?? '',
            order_index: index
          };
        });

        await WorkoutService.createWorkoutExercises(exercises);

        // Get the day index
        const dayIndex = dayMapping[plan.day] !== undefined ? dayMapping[plan.day] : -1;
        
        if (dayIndex >= 0) {
          console.log(`Scheduling workout for ${plan.day} (day index: ${dayIndex})`);
          // Create a scheduled workout for the next occurrence of this day
          const today = new Date();
          const currentDayIndex = today.getDay();
          
          // Calculate days until the next occurrence of this day
          let daysUntil = dayIndex - currentDayIndex;
          if (daysUntil <= 0) {
            daysUntil += 7;  // Add a week if the day has passed this week
          }
          
          // Calculate the date for the scheduled workout
          const scheduledDate = new Date();
          scheduledDate.setDate(today.getDate() + daysUntil);
          const dateStr = scheduledDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
          
          console.log(`Scheduling workout for date: ${dateStr}`);
          
          // Schedule the workout
          try {
            const scheduleId = await WorkoutService.scheduleWorkout({
              user_id: userId,
              workout_plan_id: createdPlan.id,
              scheduled_date: dateStr,
              duration: 60
            });
            
            console.log(`Workout scheduled with ID: ${scheduleId}`);
          } catch (scheduleError) {
            console.error(`Error scheduling workout for ${dateStr}:`, scheduleError);
          }
        }
      } catch (error) {
        console.error(`Error processing workout plan for ${plan.day}:`, error);
      }
    }
  }

  private static async processAndStoreNutritionPlan(userId: string, nutritionPlan: NutritionPlanAnalysis): Promise<void> {
    try {
      // Make sure the diet type is valid
      const validDietTypes = ['standard', 'vegetarian', 'vegan', 'keto', 'paleo', 'gluten_free'];
      const dietType = validDietTypes.includes(nutritionPlan.diet_type) ? nutritionPlan.diet_type : 'standard';
      
      // Create nutrition plan
      const plan: NutritionPlan = {
        user_id: userId,
        title: 'AI Generated Nutrition Plan',
        description: 'Personalized nutrition plan based on your fitness assessment',
        daily_calories: nutritionPlan.daily_calories,
        protein_g: nutritionPlan.protein_g,
        carbs_g: nutritionPlan.carbs_g,
        fat_g: nutritionPlan.fat_g,
        diet_type: dietType,
        ai_generated: true
      };

      const createdPlan = await NutritionService.createNutritionPlan(plan);
      
      if (!createdPlan || !createdPlan.id) {
        console.error('Failed to create nutrition plan');
        return;
      }

      // Validate and create meal plans
      const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
      const meals: MealPlan[] = nutritionPlan.meals
        .filter(meal => validMealTypes.includes(meal.meal_type)) // Only include valid meal types
        .map((meal, index) => ({
          nutrition_plan_id: createdPlan.id!,
          meal_type: meal.meal_type,
          meal_title: meal.meal_title,
          description: meal.description,
          calories: meal.calories,
          protein_g: meal.protein_g,
          carbs_g: meal.carbs_g,
          fat_g: meal.fat_g,
          order_index: index
        }));

      if (meals.length > 0) {
        await NutritionService.createMealPlans(meals);
      }
    } catch (error) {
      console.error("Error creating nutrition plan:", error);
    }
  }

  static async getWeeklyWorkouts(userId: string): Promise<Record<string, any>> {
    try {
      const today = new Date();
      const startOfWeek = new Date(today);
      const endOfWeek = new Date(today);
      
      // Set to start of current day
      startOfWeek.setHours(0, 0, 0, 0);
      
      // Calculate the end of the next 7 days
      endOfWeek.setDate(today.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      
      // Format dates for DB query
      const startDate = startOfWeek.toISOString().split('T')[0];
      const endDate = endOfWeek.toISOString().split('T')[0];
      
      console.log(`Fetching workouts from ${startDate} to ${endDate}`);
      
      // Get scheduled workouts for the week
      const scheduledWorkouts = await WorkoutService.getWorkoutSchedule(
        userId, 
        startDate, 
        endDate
      );
      
      console.log(`Found ${scheduledWorkouts.length} scheduled workouts`);
      
      // Format results by day of week
      const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const workoutsByDay: Record<string, any> = {};
      
      // Initialize all days
      weekDays.forEach(day => {
        workoutsByDay[day] = null;
      });
      
      // Build workouts for each day
      const workoutPromises = scheduledWorkouts.map(async (scheduled) => {
        try {
          const workoutDate = new Date(scheduled.scheduled_date);
          const dayIndex = workoutDate.getDay();
          const dayName = weekDays[dayIndex];
          
          console.log(`Processing scheduled workout for ${dayName}: ${scheduled.workout_plan_id}`);
          
          const workoutPlan = await WorkoutService.getWorkoutPlanById(scheduled.workout_plan_id);
          
          if (workoutPlan) {
            const exercises = await WorkoutService.getWorkoutExercises(workoutPlan.id!);
            
            workoutsByDay[dayName] = {
              id: workoutPlan.id,
              schedule_id: scheduled.id,
              title: workoutPlan.title,
              description: workoutPlan.description,
              exercises: exercises.map(ex => ({
                id: ex.id,
                name: ex.name,
                sets: ex.sets,
                reps: ex.reps,
                weight: ex.weight || 'bodyweight',
                completed: false
              }))
            };
          }
        } catch (error) {
          console.error("Error processing workout for day:", error);
        }
      });
      
      await Promise.all(workoutPromises);
      
      return workoutsByDay;
    } catch (error) {
      console.error('Error fetching weekly workouts:', error);
      return {};
    }
  }

  static async getCurrentNutritionPlan(userId: string): Promise<any> {
    try {
      // Get the most recent AI-generated nutrition plan
      const nutritionPlans = await NutritionService.getNutritionPlans(userId);
      const aiGeneratedPlans = nutritionPlans.filter(plan => plan.ai_generated);
      
      if (aiGeneratedPlans.length === 0) {
        return null;
      }
      
      // Sort by creation date, newest first
      aiGeneratedPlans.sort((a, b) => {
        const dateA = new Date(a.created_at || '');
        const dateB = new Date(b.created_at || '');
        return dateB.getTime() - dateA.getTime();
      });
      
      const latestPlan = aiGeneratedPlans[0];
      const meals = await NutritionService.getMealPlans(latestPlan.id!);
      
      return {
        id: latestPlan.id,
        calories: latestPlan.daily_calories,
        protein: latestPlan.protein_g,
        carbs: latestPlan.carbs_g,
        fat: latestPlan.fat_g,
        diet_type: latestPlan.diet_type,
        meals: meals.map(meal => ({
          id: meal.id,
          type: meal.meal_type,
          title: meal.meal_title,
          description: meal.description || '',
          calories: meal.calories,
          protein: meal.protein_g,
          carbs: meal.carbs_g,
          fat: meal.fat_g
        }))
      };
    } catch (error) {
      console.error('Error fetching current nutrition plan:', error);
      return null;
    }
  }

  static async getLatestAssessmentData(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('assessment_data')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (error) {
        console.error('Error fetching assessment data:', error);
        return null;
      }
      
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error in getLatestAssessmentData:', error);
      return null;
    }
  }
}
