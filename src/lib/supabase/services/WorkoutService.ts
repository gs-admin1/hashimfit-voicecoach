import { supabase } from "@/integrations/supabase/client";

export interface WorkoutPlan {
  id?: string;
  user_id: string;
  title: string;
  description?: string;
  category?: string;
  difficulty?: number;
  estimated_duration?: string;
  target_muscles?: string[];
  ai_generated?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface WorkoutExercise {
  id?: string;
  workout_plan_id: string;
  name: string;
  sets: number;
  reps: string;
  weight?: string;
  rest_time?: string;
  notes?: string;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export interface WorkoutLog {
  id?: string;
  user_id: string;
  workout_plan_id?: string;
  start_time: string;
  end_time?: string;
  duration?: string;
  rating?: number;
  notes?: string;
  calories_burned?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ExerciseLog {
  id?: string;
  workout_log_id: string;
  exercise_name: string;
  sets_completed: number;
  reps_completed: string;
  weight_used?: string;
  rest_time?: string;
  notes?: string;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export interface WorkoutSchedule {
  id?: string;
  user_id: string;
  workout_plan_id: string;
  scheduled_date: string;
  scheduled_time?: string;
  duration?: string;
  is_completed?: boolean;
  completion_date?: string;
  workout_log_id?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export class WorkoutService {
  static async getWorkoutPlans(userId: string): Promise<WorkoutPlan[]> {
    try {
      const { data, error } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error("Error fetching workout plans:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error in getWorkoutPlans:", error);
      return [];
    }
  }

  static async createWorkoutPlan(workoutPlan: Omit<WorkoutPlan, 'id' | 'created_at' | 'updated_at'>): Promise<WorkoutPlan | null> {
    try {
      const { data, error } = await supabase
        .from('workout_plans')
        .insert(workoutPlan)
        .select('*')
        .single();

      if (error) {
        console.error("Error creating workout plan:", error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error("Error in createWorkoutPlan:", error);
      return null;
    }
  }

  static async getWorkoutPlanById(workoutPlanId: string): Promise<WorkoutPlan | null> {
    try {
      const { data, error } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('id', workoutPlanId)
        .single();

      if (error) {
        console.error("Error fetching workout plan:", error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error("Error in getWorkoutPlanById:", error);
      return null;
    }
  }

  static async getWorkoutExercises(workoutPlanId: string): Promise<WorkoutExercise[]> {
    try {
      const { data, error } = await supabase
        .from('workout_exercises')
        .select('*')
        .eq('workout_plan_id', workoutPlanId)
        .order('order_index', { ascending: true });

      if (error) {
        console.error("Error fetching workout exercises:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error in getWorkoutExercises:", error);
      return [];
    }
  }

  static async createWorkoutExercise(workoutExercise: Omit<WorkoutExercise, 'id' | 'created_at' | 'updated_at'>): Promise<WorkoutExercise | null> {
    try {
      const { data, error } = await supabase
        .from('workout_exercises')
        .insert(workoutExercise)
        .select('*')
        .single();

      if (error) {
        console.error("Error creating workout exercise:", error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error("Error in createWorkoutExercise:", error);
      return null;
    }
  }

  static async updateWorkoutExercise(workoutExerciseId: string, updates: Partial<WorkoutExercise>): Promise<WorkoutExercise | null> {
    try {
      const { data, error } = await supabase
        .from('workout_exercises')
        .update(updates)
        .eq('id', workoutExerciseId)
        .select('*')
        .single();

      if (error) {
        console.error("Error updating workout exercise:", error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error("Error in updateWorkoutExercise:", error);
      return null;
    }
  }

  static async deleteWorkoutExercise(workoutExerciseId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('workout_exercises')
        .delete()
        .eq('id', workoutExerciseId);

      if (error) {
        console.error("Error deleting workout exercise:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in deleteWorkoutExercise:", error);
      return false;
    }
  }

  static async getWorkoutSchedule(userId: string, startDate: string, endDate: string): Promise<WorkoutSchedule[]> {
    try {
      const { data, error } = await supabase
        .from('workout_schedule')
        .select('*')
        .eq('user_id', userId)
        .gte('scheduled_date', startDate)
        .lte('scheduled_date', endDate);

      if (error) {
        console.error("Error fetching workout schedule:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error in getWorkoutSchedule:", error);
      return [];
    }
  }

  static async scheduleWorkout(workoutSchedule: Omit<WorkoutSchedule, 'id' | 'created_at' | 'updated_at' | 'is_completed' | 'completion_date' | 'workout_log_id'>): Promise<WorkoutSchedule | null> {
    try {
      const { data, error } = await supabase
        .from('workout_schedule')
        .insert(workoutSchedule)
        .select('*')
        .single();

      if (error) {
        console.error("Error scheduling workout:", error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error("Error in scheduleWorkout:", error);
      return null;
    }
  }

  static async updateScheduledWorkout(scheduleId: string, updates: Partial<WorkoutSchedule>): Promise<WorkoutSchedule | null> {
    try {
      const { data, error } = await supabase
        .from('workout_schedule')
        .update(updates)
        .eq('id', scheduleId)
        .select('*')
        .single();

      if (error) {
        console.error("Error updating scheduled workout:", error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error("Error in updateScheduledWorkout:", error);
      return null;
    }
  }

  static async logWorkout(workoutLog: Omit<WorkoutLog, 'id'>, exerciseLogs: Omit<ExerciseLog, 'workout_log_id'>[] = []): Promise<string | null> {
    try {
      console.log("🏋️ Creating workout log:", workoutLog);
      
      // Create the workout log
      const { data: logData, error: logError } = await supabase
        .from('workout_logs')
        .insert(workoutLog)
        .select('id')
        .single();

      if (logError) {
        console.error("❌ Error creating workout log:", logError);
        throw logError;
      }

      if (!logData?.id) {
        console.error("❌ No workout log ID returned");
        throw new Error("Failed to create workout log - no ID returned");
      }

      console.log("✅ Workout log created with ID:", logData.id);

      // Add exercise logs if provided
      if (exerciseLogs.length > 0) {
        const exerciseLogsWithWorkoutId = exerciseLogs.map(exercise => ({
          ...exercise,
          workout_log_id: logData.id
        }));

        console.log("📝 Adding exercise logs:", exerciseLogsWithWorkoutId);

        const { error: exerciseError } = await supabase
          .from('exercise_logs')
          .insert(exerciseLogsWithWorkoutId);

        if (exerciseError) {
          console.error("❌ Error adding exercise logs:", exerciseError);
          // Don't throw here, just log the error since the workout log was created successfully
        } else {
          console.log("✅ Exercise logs added successfully");
        }
      }

      return logData.id;
    } catch (error) {
      console.error("❌ Error in logWorkout:", error);
      return null;
    }
  }

  static async addExerciseLogs(workoutLogId: string, exerciseLogs: Omit<ExerciseLog, 'workout_log_id'>[]): Promise<boolean> {
    try {
      console.log("➕ Adding exercise logs to workout:", workoutLogId, exerciseLogs);
      
      const exerciseLogsWithWorkoutId = exerciseLogs.map(exercise => ({
        ...exercise,
        workout_log_id: workoutLogId
      }));

      const { error } = await supabase
        .from('exercise_logs')
        .insert(exerciseLogsWithWorkoutId);

      if (error) {
        console.error("❌ Error adding exercise logs:", error);
        return false;
      }

      console.log("✅ Exercise logs added successfully");
      return true;
    } catch (error) {
      console.error("❌ Error in addExerciseLogs:", error);
      return false;
    }
  }

  static async completeScheduledWorkout(scheduleId: string, workoutLogId: string): Promise<boolean> {
    try {
      console.log("🎯 Completing scheduled workout:", scheduleId, "with log:", workoutLogId);
      
      const { error } = await supabase
        .from('workout_schedule')
        .update({
          is_completed: true,
          workout_log_id: workoutLogId,
          completion_date: new Date().toISOString()
        })
        .eq('id', scheduleId);

      if (error) {
        console.error("❌ Error completing scheduled workout:", error);
        return false;
      }

      console.log("✅ Scheduled workout completed successfully");
      return true;
    } catch (error) {
      console.error("❌ Error in completeScheduledWorkout:", error);
      return false;
    }
  }

  static async getExerciseLogs(workoutLogId: string): Promise<ExerciseLog[]> {
    try {
      const { data, error } = await supabase
        .from('exercise_logs')
        .select('*')
        .eq('workout_log_id', workoutLogId);

      if (error) {
        console.error("Error fetching exercise logs:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error in getExerciseLogs:", error);
      return [];
    }
  }

  static async deleteExerciseLogs(workoutLogId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('exercise_logs')
        .delete()
        .eq('workout_log_id', workoutLogId);

      if (error) {
        console.error("Error deleting exercise logs:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in deleteExerciseLogs:", error);
      return false;
    }
  }

  static async deleteWorkoutLog(workoutLogId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('workout_logs')
        .delete()
        .eq('id', workoutLogId);

      if (error) {
        console.error("Error deleting workout log:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in deleteWorkoutLog:", error);
      return false;
    }
  }
}
