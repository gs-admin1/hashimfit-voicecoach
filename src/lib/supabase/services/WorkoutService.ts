
import supabase from '@/lib/supabase';

export interface WorkoutPlan {
  id?: string;
  user_id: string;
  title: string;
  description?: string;
  category: 'strength' | 'cardio' | 'hiit' | 'recovery' | 'sport_specific' | 'custom';
  difficulty: number;
  estimated_duration?: number;
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
  rest_time?: number;
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
  duration?: number;
  calories_burned?: number;
  rating?: number;
  notes?: string;
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
  rest_time?: number;
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
  scheduled_time?: string | null;
  duration?: number | null;
  is_completed?: boolean;
  completion_date?: string | null;
  workout_log_id?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export class WorkoutService {
  // Workout Plans
  static async getWorkoutPlans(userId: string): Promise<WorkoutPlan[]> {
    try {
      const { data, error } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as WorkoutPlan[];
    } catch (error) {
      console.error('Error fetching workout plans:', error);
      return [];
    }
  }

  static async getWorkoutPlanById(planId: string): Promise<WorkoutPlan | null> {
    try {
      const { data, error } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('id', planId)
        .single();
        
      if (error) throw error;
      return data as WorkoutPlan;
    } catch (error) {
      console.error('Error fetching workout plan:', error);
      return null;
    }
  }

  static async createWorkoutPlan(plan: WorkoutPlan): Promise<WorkoutPlan | null> {
    try {
      const { data, error } = await supabase
        .from('workout_plans')
        .insert([plan])
        .select()
        .single();
        
      if (error) throw error;
      return data as WorkoutPlan;
    } catch (error) {
      console.error('Error creating workout plan:', error);
      return null;
    }
  }

  static async updateWorkoutPlan(planId: string, plan: Partial<WorkoutPlan>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('workout_plans')
        .update(plan)
        .eq('id', planId);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating workout plan:', error);
      return false;
    }
  }

  static async deleteWorkoutPlan(planId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('workout_plans')
        .delete()
        .eq('id', planId);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting workout plan:', error);
      return false;
    }
  }

  // Workout Exercises
  static async getWorkoutExercises(planId: string): Promise<WorkoutExercise[]> {
    try {
      const { data, error } = await supabase
        .from('workout_exercises')
        .select('*')
        .eq('workout_plan_id', planId)
        .order('order_index', { ascending: true });
        
      if (error) throw error;
      return data as WorkoutExercise[];
    } catch (error) {
      console.error('Error fetching workout exercises:', error);
      return [];
    }
  }

  static async createWorkoutExercises(exercises: WorkoutExercise[]): Promise<WorkoutExercise[] | null> {
    try {
      const { data, error } = await supabase
        .from('workout_exercises')
        .insert(exercises)
        .select();
        
      if (error) throw error;
      return data as WorkoutExercise[];
    } catch (error) {
      console.error('Error creating workout exercises:', error);
      return null;
    }
  }
  
  static async deleteWorkoutExercise(exerciseId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('workout_exercises')
        .delete()
        .eq('id', exerciseId);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting workout exercise:', error);
      return false;
    }
  }

  // Workout Logs
  static async logWorkout(log: WorkoutLog, exercises: Omit<ExerciseLog, 'workout_log_id'>[]): Promise<string | null> {
    try {
      // Start a transaction
      // First insert the workout log
      const { data: workoutData, error: workoutError } = await supabase
        .from('workout_logs')
        .insert([log])
        .select()
        .single();
        
      if (workoutError) throw workoutError;
      
      // Then insert the exercise logs
      const exerciseLogs = exercises.map(ex => ({
        workout_log_id: workoutData.id,
        ...ex
      }));
      
      const { error: exerciseError } = await supabase
        .from('exercise_logs')
        .insert(exerciseLogs);
        
      if (exerciseError) throw exerciseError;
      
      return workoutData.id;
    } catch (error) {
      console.error('Error logging workout:', error);
      return null;
    }
  }

  static async getWorkoutLogs(userId: string): Promise<WorkoutLog[]> {
    try {
      const { data, error } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: false });
        
      if (error) throw error;
      return data as WorkoutLog[];
    } catch (error) {
      console.error('Error fetching workout logs:', error);
      return [];
    }
  }

  static async getExerciseLogs(workoutLogId: string): Promise<ExerciseLog[]> {
    try {
      const { data, error } = await supabase
        .from('exercise_logs')
        .select('*')
        .eq('workout_log_id', workoutLogId)
        .order('order_index', { ascending: true });
        
      if (error) throw error;
      return data as ExerciseLog[];
    } catch (error) {
      console.error('Error fetching exercise logs:', error);
      return [];
    }
  }

  // Workout Schedule
  static async scheduleWorkout(schedule: Omit<WorkoutSchedule, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('workout_schedule')
        .insert([schedule])
        .select()
        .single();
        
      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error scheduling workout:', error);
      return null;
    }
  }

  static async getWorkoutSchedule(userId: string, startDate: string, endDate: string): Promise<WorkoutSchedule[]> {
    try {
      const { data, error } = await supabase
        .from('workout_schedule')
        .select('*')
        .eq('user_id', userId)
        .gte('scheduled_date', startDate)
        .lte('scheduled_date', endDate)
        .order('scheduled_date', { ascending: true });
        
      if (error) throw error;
      return data as WorkoutSchedule[];
    } catch (error) {
      console.error('Error fetching workout schedule:', error);
      return [];
    }
  }

  static async completeScheduledWorkout(scheduleId: string, workoutLogId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('workout_schedule')
        .update({
          is_completed: true,
          completion_date: new Date().toISOString(),
          workout_log_id: workoutLogId
        })
        .eq('id', scheduleId);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error completing scheduled workout:', error);
      return false;
    }
  }
}
