
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('Missing Authorization header')
      throw new Error('Missing Authorization header')
    }

    console.log('Auth header present:', authHeader ? 'Yes' : 'No')

    // Extract the JWT token from the authorization header
    const token = authHeader.replace('Bearer ', '')

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
        auth: {
          persistSession: false,
        },
      }
    )

    // Set the session using the extracted token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    
    if (userError) {
      console.error('Error getting user:', userError)
      throw new Error(`Authentication failed: ${userError.message}`)
    }
    
    if (!user) {
      console.error('No user found in token')
      throw new Error('No authenticated user found')
    }

    console.log('User authenticated successfully:', user.id)

    const assessmentData = await req.json()
    console.log('Received assessment data:', assessmentData)

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      console.error('Missing OpenAI API Key')
      throw new Error('Missing OpenAI API Key')
    }

    // Map fitness goals to match our database constraints
    const fitnessGoalMapping = {
      'muscle_gain': 'muscle_gain',
      'weight_loss': 'weight_loss', 
      'endurance': 'endurance',
      'sport_specific': 'sports_performance',
      'general_fitness': 'general_fitness'
    }

    // Map equipment values to match our database constraints
    const equipmentMapping = {
      'full_gym': 'full_gym',
      'home_gym': 'home_gym',
      'minimal': 'minimal',
      'bodyweight_only': 'bodyweight',
      'none': 'none'
    }

    const mappedFitnessGoal = fitnessGoalMapping[assessmentData.fitnessGoal] || 'general_fitness'
    const mappedEquipment = equipmentMapping[assessmentData.equipment] || 'minimal'

    // Generate comprehensive prompt for OpenAI
    const prompt = `Create a comprehensive fitness and nutrition plan for a user with the following profile:

Demographics:
- Age: ${assessmentData.age}
- Gender: ${assessmentData.gender}
- Height: ${assessmentData.height}cm
- Weight: ${assessmentData.weight}kg

Fitness Profile:
- Goal: ${mappedFitnessGoal}
- Workout frequency: ${assessmentData.workoutFrequency} days per week
- Equipment available: ${mappedEquipment}
- Diet preference: ${assessmentData.diet}
- Sports played: ${assessmentData.sportsPlayed?.join(', ') || 'None'}
- Allergies: ${assessmentData.allergies?.join(', ') || 'None'}

Create a structured plan that includes:

1. A 4-week workout schedule with specific exercises, sets, reps, and rest periods
2. Nutrition targets with daily calorie and macro goals
3. General recommendations for success

Return ONLY a valid JSON object with this exact structure:
{
  "workout_schedule": [
    {
      "week": 1,
      "day": "Monday",
      "workout_title": "Upper Body Strength",
      "exercises": [
        {
          "name": "Push-ups",
          "sets": 3,
          "reps": "8-12",
          "rest_seconds": 60,
          "notes": "Focus on form"
        }
      ]
    }
  ],
  "nutrition_targets": {
    "daily_calories": 2200,
    "protein_g": 165,
    "carbs_g": 220,
    "fat_g": 85,
    "diet_type": "${assessmentData.diet}"
  },
  "recommendations": {
    "workout_tips": "Start with lighter weights and focus on proper form",
    "nutrition_tips": "Eat protein with every meal for muscle recovery",
    "weekly_goals": "Complete 3 workouts and track your nutrition daily"
  }
}`

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { 
            role: 'system', 
            content: 'You are a professional fitness coach and nutritionist who creates personalized workout and nutrition plans. Always respond with valid JSON only.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      }),
    })

    if (!openAIResponse.ok) {
      console.error('OpenAI API error:', openAIResponse.statusText)
      throw new Error(`OpenAI API error: ${openAIResponse.statusText}`)
    }

    const openAIData = await openAIResponse.json()
    const planData = JSON.parse(openAIData.choices[0].message.content)
    
    console.log('Generated plan data:', planData)

    // Store workout plans in the database
    const workoutPlans = []
    const workoutSchedules = []
    
    // Group exercises by week and workout
    const workoutsByWeekAndDay = {}
    
    for (const scheduleItem of planData.workout_schedule) {
      const key = `Week ${scheduleItem.week} - ${scheduleItem.workout_title}`
      
      if (!workoutsByWeekAndDay[key]) {
        workoutsByWeekAndDay[key] = {
          title: scheduleItem.workout_title,
          week: scheduleItem.week,
          day: scheduleItem.day,
          exercises: []
        }
      }
      
      if (scheduleItem.exercises) {
        workoutsByWeekAndDay[key].exercises.push(...scheduleItem.exercises)
      }
    }

    // Create workout plans and exercises
    for (const [key, workout] of Object.entries(workoutsByWeekAndDay)) {
      // Create workout plan
      const { data: workoutPlan, error: workoutPlanError } = await supabaseClient
        .from('workout_plans')
        .insert({
          user_id: user.id,
          title: workout.title,
          description: `Week ${workout.week} - ${workout.title}`,
          category: 'strength',
          difficulty: 3,
          estimated_duration: '45 minutes',
          ai_generated: true
        })
        .select()
        .single()

      if (workoutPlanError) {
        console.error('Error creating workout plan:', workoutPlanError)
        throw workoutPlanError
      }

      workoutPlans.push(workoutPlan)

      // Create exercises for this workout plan
      const exercisesToInsert = workout.exercises.map((exercise, index) => ({
        workout_plan_id: workoutPlan.id,
        name: exercise.name,
        sets: exercise.sets,
        reps: exercise.reps,
        weight: exercise.weight || 'bodyweight',
        rest_time: exercise.rest_seconds ? `${exercise.rest_seconds} seconds` : '60 seconds',
        notes: exercise.notes,
        order_index: index
      }))

      const { error: exercisesError } = await supabaseClient
        .from('workout_exercises')
        .insert(exercisesToInsert)

      if (exercisesError) {
        console.error('Error creating exercises:', exercisesError)
        throw exercisesError
      }

      // Schedule this workout for the appropriate day in the next 4 weeks
      const startDate = new Date()
      const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(workout.day)
      
      for (let weekOffset = workout.week - 1; weekOffset < 4; weekOffset += 4) {
        const targetDate = new Date(startDate)
        targetDate.setDate(startDate.getDate() + (weekOffset * 7) + (dayOfWeek - startDate.getDay()))
        
        const { error: scheduleError } = await supabaseClient
          .from('workout_schedule')
          .insert({
            user_id: user.id,
            workout_plan_id: workoutPlan.id,
            scheduled_date: targetDate.toISOString().split('T')[0],
            is_completed: false
          })

        if (scheduleError) {
          console.error('Error scheduling workout:', scheduleError)
        }
      }
    }

    // Create nutrition plan
    const { data: nutritionPlan, error: nutritionError } = await supabaseClient
      .from('nutrition_plans')
      .insert({
        user_id: user.id,
        title: 'AI Generated Nutrition Plan',
        description: 'Personalized nutrition plan based on your fitness goals',
        daily_calories: planData.nutrition_targets.daily_calories,
        protein_g: planData.nutrition_targets.protein_g,
        carbs_g: planData.nutrition_targets.carbs_g,
        fat_g: planData.nutrition_targets.fat_g,
        diet_type: planData.nutrition_targets.diet_type,
        ai_generated: true
      })
      .select()
      .single()

    if (nutritionError) {
      console.error('Error creating nutrition plan:', nutritionError)
      throw nutritionError
    }

    // Update user profile to mark assessment as completed with proper mapping
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .update({ 
        has_completed_assessment: true,
        fitness_goal: mappedFitnessGoal,
        workout_frequency: assessmentData.workoutFrequency,
        diet: assessmentData.diet,
        equipment: mappedEquipment,
        sports_played: assessmentData.sportsPlayed,
        allergies: assessmentData.allergies,
        age: parseInt(assessmentData.age),
        gender: assessmentData.gender,
        height: parseFloat(assessmentData.height),
        weight: parseFloat(assessmentData.weight)
      })
      .eq('id', user.id)

    if (profileError) {
      console.error('Error updating profile:', profileError)
      throw profileError
    }

    // Store assessment data
    const { error: assessmentError } = await supabaseClient
      .from('assessment_data')
      .insert({
        user_id: user.id,
        age: parseInt(assessmentData.age),
        gender: assessmentData.gender,
        height: parseFloat(assessmentData.height),
        weight: parseFloat(assessmentData.weight),
        fitness_goal: mappedFitnessGoal,
        workout_frequency: assessmentData.workoutFrequency,
        diet: assessmentData.diet,
        equipment: mappedEquipment,
        sports_played: assessmentData.sportsPlayed || [],
        allergies: assessmentData.allergies || []
      })

    if (assessmentError) {
      console.error('Error storing assessment data:', assessmentError)
      throw assessmentError
    }

    console.log('Assessment completed successfully for user:', user.id)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Fitness plan generated and stored successfully',
        data: {
          workout_plans: workoutPlans.length,
          nutrition_plan: nutritionPlan.id,
          recommendations: planData.recommendations
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in generate-workout-plan function:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
