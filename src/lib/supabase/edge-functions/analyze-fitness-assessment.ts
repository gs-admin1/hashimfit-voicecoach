
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
    
    // Ensure there's a valid user ID
    if (!req.user_id) {
      throw new Error('User ID is required');
    }
    
    // Make sure the assessment data is complete
    const requiredFields = [
      'age', 'gender', 'height', 'weight', 
      'fitnessGoal', 'workoutFrequency', 'diet', 'equipment'
    ];
    
    for (const field of requiredFields) {
      if (req.assessment[field as keyof typeof req.assessment] === undefined) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
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
