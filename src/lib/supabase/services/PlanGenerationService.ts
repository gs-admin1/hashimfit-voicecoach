
import supabase from '@/lib/supabase';

export interface AssessmentData {
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
}

export interface PlanGenerationResponse {
  success: boolean;
  message: string;
  data?: {
    workout_plans: number;
    nutrition_plan: string;
    recommendations: {
      workout_tips: string;
      nutrition_tips: string;
      weekly_goals: string;
    };
  };
  error?: string;
}

export class PlanGenerationService {
  static async generateFitnessPlan(assessmentData: AssessmentData): Promise<PlanGenerationResponse> {
    try {
      console.log('Calling generate-workout-plan Edge Function with data:', assessmentData);
      
      const { data, error } = await supabase.functions.invoke<PlanGenerationResponse>('generate-workout-plan', {
        body: assessmentData,
      });

      if (error) {
        console.error('Edge Function error:', error);
        throw new Error(error.message || 'Failed to generate fitness plan');
      }

      if (!data) {
        throw new Error('No response from plan generation function');
      }

      console.log('Plan generation response:', data);
      return data;
    } catch (error) {
      console.error('Error calling plan generation service:', error);
      throw error;
    }
  }

  static async checkUserPlanStatus(userId: string): Promise<boolean> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('has_completed_assessment')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error checking plan status:', error);
        return false;
      }

      return profile?.has_completed_assessment || false;
    } catch (error) {
      console.error('Error checking user plan status:', error);
      return false;
    }
  }
}
