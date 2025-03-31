
import supabase from '@/lib/supabase';

interface FitnessAssessmentRequest {
  user_id: string;
  assessment: {
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
  };
}

export async function analyzeFitnessAssessment(req: FitnessAssessmentRequest) {
  try {
    const { data, error } = await supabase.functions.invoke<any>('analyze-fitness-assessment', {
      body: req,
    });

    if (error) throw new Error(error.message);
    if (!data) throw new Error('No response from fitness assessment function');
    
    return data;
  } catch (error) {
    console.error('Error calling fitness assessment function:', error);
    throw error;
  }
}
