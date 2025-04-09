
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
    console.log("Calling fitness assessment function with data:", {
      userId: req.user_id,
      assessmentData: {
        ...req.assessment,
        sportsPlayed: req.assessment.sportsPlayed?.join(', '),
        allergies: req.assessment.allergies?.join(', ')
      }
    });
    
    const { data, error } = await supabase.functions.invoke<any>('analyze-fitness-assessment', {
      body: req,
    });

    if (error) {
      console.error("Supabase function error:", error);
      throw new Error(error.message);
    }
    if (!data) {
      console.error("No response data from fitness assessment function");
      throw new Error('No response from fitness assessment function');
    }
    
    console.log("Received fitness assessment analysis:", data);
    return data;
  } catch (error) {
    console.error('Error calling fitness assessment function:', error);
    throw error;
  }
}
