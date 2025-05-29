
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

    // Send the raw assessment data directly to OpenAI in the expected format
    const assessmentPrompt = JSON.stringify({
      age: parseInt(assessmentData.age),
      gender: assessmentData.gender,
      height: parseFloat(assessmentData.height),
      weight: parseFloat(assessmentData.weight),
      fitness_goal: assessmentData.fitnessGoal,
      workout_frequency: parseInt(assessmentData.workoutFrequency),
      equipment: assessmentData.equipment,
      diet_type: assessmentData.diet,
      sports_played: assessmentData.sportsPlayed || [],
      allergies: assessmentData.allergies || []
    })

    console.log('Sending assessment data to OpenAI:', assessmentPrompt)

    // Call OpenAI API with NEW MUSCLE! system instructions
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: `## 🧠 Unified System Instructions for OpenAI Assistant ("NEW MUSCLE!")

**You are NEW MUSCLE!** — an AI fitness coach tailored to deliver **personalized, motivational, and scientifically accurate** training and nutrition plans. Each client has a unique assistant instance built around their assessment data and fitness goals.

Your job is to collect client inputs, generate a complete fitness + nutrition blueprint, and return a structured plan **in the exact format provided below** for storage in the user's Supabase-connected app (HashimFit).

---

### 💪 Responsibilities

1. **Collect Key Client Data**
   * Equipment access (e.g., bodyweight, dumbbells, gym)
   * Weekly schedule & time per session
   * Injuries or health restrictions
   * Goals (muscle gain, fat loss, strength, etc.)
   * Experience level (beginner, intermediate, advanced)
   * Dietary preferences

2. **Workout Plan Generation**
   * Create a **4-week schedule** (at minimum) with:
     * Day, week, title, difficulty, duration, and description
     * Exercises with sets, reps, weight, rest, and notes
   * Prioritize:
     * **Progressive overload**
     * **Injury prevention**
     * **Muscle group balance**
   * Use scientific principles from uploaded documents (e.g., hypertrophy training, push-pull-legs splits)

3. **Nutrition Plan Generation**
   * Tailor macronutrient targets to goal and experience
   * Provide **four meals/day**: breakfast, lunch, dinner, snack
   * Include meal title, description, calories, and macros

4. **Motivational Guidance**
   * Offer workout tips, recovery advice, nutrition reminders, and weekly goals
   * Tone should be encouraging and professional

---

### ✅ Response Format (MUST match this schema exactly)

\`\`\`json
{
  "workout_schedule": [...],  // 4-week training program
  "nutrition_plan": {
    "daily_calories": 2200,
    "protein_g": 165,
    "carbs_g": 220,
    "fat_g": 85,
    "diet_type": "standard",  // Options: standard, vegetarian, vegan, keto, paleo, gluten_free
    "meals": [
      {
        "meal_type": "breakfast",  // breakfast, lunch, dinner, snack
        "meal_title": "Example",
        "description": "Ingredients + prep",
        "calories": 400,
        "protein_g": 30,
        "carbs_g": 40,
        "fat_g": 15
      }
    ]
  },
  "recommendations": {
    "workout_tips": "Motivational advice for training",
    "nutrition_tips": "Hydration, timing, portion reminders",
    "weekly_goals": "Clear goals for the user to achieve this week"
  }
}
\`\`\`

---

### 🧩 Database Mapping Strategy (internal logic)

* **Workout Plans** → \`workout_plans\`, \`workout_exercises\`, \`workout_schedule\`
* **Nutrition** → \`nutrition_plans\`, \`meal_plans\`
* **User Profile** → \`profiles\`, \`assessment_data\`

---

### ⚠️ Formatting Rules

* \`workout_schedule\` must include valid \`category\` values:
  \`strength\`, \`cardio\`, \`hiit\`, \`recovery\`, \`sport_specific\`, \`custom\`
* All \`day\` fields must be capitalized full names: \`Monday\`, \`Tuesday\`, etc.
* All \`meal_type\` values must be: \`breakfast\`, \`lunch\`, \`dinner\`, \`snack\`
* All numeric values (reps, weight, macros) must be **realistic and actionable**
* Avoid vague ranges like "varies" — prefer exact or goal-aligned quantities
* Use \`"bodyweight"\` if no weight is needed for an exercise
* \`difficulty\` must be a NUMBER from 1-5 (1=beginner, 5=expert)

---

### 🎯 Behavior Notes

* Always return in **strict JSON** — no markdown or explanations
* Avoid conversational phrasing outside the required schema
* If user inputs are incomplete, **infer based on typical beginner/intermediate scenarios**
* Prioritize structure over filler: **response must pass validation by the app**` 
          },
          { role: 'user', content: assessmentPrompt }
        ],
        temperature: 0.2,
        max_tokens: 4000,
        response_format: { type: "json_object" }
      }),
    })

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text()
      console.error('OpenAI API error:', openAIResponse.status, errorText)
      throw new Error(`OpenAI API error: ${openAIResponse.status} - ${errorText}`)
    }

    const openAIData = await openAIResponse.json()
    console.log('OpenAI raw response:', openAIData)
    
    if (!openAIData.choices || !openAIData.choices[0] || !openAIData.choices[0].message) {
      throw new Error('Invalid OpenAI response structure')
    }

    let planData
    try {
      const rawContent = openAIData.choices[0].message.content
      console.log('Raw content from OpenAI:', rawContent)
      
      // Clean up the JSON content to handle potential formatting issues
      let cleanedContent = rawContent.trim()
      
      // Remove any markdown code block indicators if present
      cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '')
      
      // Try to parse the cleaned JSON
      planData = JSON.parse(cleanedContent)
      console.log('Successfully parsed plan data:', planData)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.error('Failed to parse content:', openAIData.choices[0].message.content)
      throw new Error(`Failed to parse OpenAI response as JSON: ${parseError.message}`)
    }

    // Validate the required structure
    if (!planData.workout_schedule || !planData.nutrition_plan || !planData.recommendations) {
      console.error('Invalid plan data structure:', planData)
      throw new Error('Invalid plan data structure from OpenAI')
    }

    console.log('Generated plan data:', planData)

    // Store workout plans in the database
    const workoutPlans = []
    
    // Group exercises by week and workout
    const workoutsByWeekAndDay = {}
    
    for (const scheduleItem of planData.workout_schedule) {
      const key = `Week ${scheduleItem.week} - ${scheduleItem.workout_title}`
      
      if (!workoutsByWeekAndDay[key]) {
        workoutsByWeekAndDay[key] = {
          title: scheduleItem.workout_title,
          description: scheduleItem.description || `Week ${scheduleItem.week} - ${scheduleItem.workout_title}`,
          category: scheduleItem.category || 'strength',
          difficulty: parseInt(scheduleItem.difficulty) || 3, // Ensure it's a number
          estimated_duration: scheduleItem.estimated_duration || '45 minutes',
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
      console.log(`Creating workout plan: ${workout.title}`)
      
      // Create workout plan
      const { data: workoutPlan, error: workoutPlanError } = await supabaseClient
        .from('workout_plans')
        .insert({
          user_id: user.id,
          title: workout.title,
          description: workout.description,
          category: workout.category,
          difficulty: workout.difficulty,
          estimated_duration: workout.estimated_duration,
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
      
      if (dayOfWeek !== -1) {
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
    }

    console.log('Created workout plans successfully')

    // Create nutrition plan
    const { data: nutritionPlan, error: nutritionError } = await supabaseClient
      .from('nutrition_plans')
      .insert({
        user_id: user.id,
        title: 'NEW MUSCLE! Nutrition Plan',
        description: 'Personalized nutrition plan generated by NEW MUSCLE! AI Coach',
        daily_calories: planData.nutrition_plan.daily_calories,
        protein_g: planData.nutrition_plan.protein_g,
        carbs_g: planData.nutrition_plan.carbs_g,
        fat_g: planData.nutrition_plan.fat_g,
        diet_type: planData.nutrition_plan.diet_type,
        ai_generated: true
      })
      .select()
      .single()

    if (nutritionError) {
      console.error('Error creating nutrition plan:', nutritionError)
      throw nutritionError
    }

    // Create meal plans if provided
    if (planData.nutrition_plan.meals && planData.nutrition_plan.meals.length > 0) {
      const mealPlansToInsert = planData.nutrition_plan.meals.map((meal, index) => ({
        nutrition_plan_id: nutritionPlan.id,
        meal_type: meal.meal_type,
        meal_title: meal.meal_title,
        description: meal.description,
        calories: meal.calories,
        protein_g: meal.protein_g,
        carbs_g: meal.carbs_g,
        fat_g: meal.fat_g,
        order_index: index
      }))

      const { error: mealPlansError } = await supabaseClient
        .from('meal_plans')
        .insert(mealPlansToInsert)

      if (mealPlansError) {
        console.error('Error creating meal plans:', mealPlansError)
        throw mealPlansError
      }
    }

    console.log('Created nutrition plan successfully')

    // Map assessment data to database format
    const fitnessGoalMapping = {
      'muscle_gain': 'muscle_gain',
      'weight_loss': 'weight_loss', 
      'endurance': 'endurance',
      'sport_specific': 'sports_performance',
      'general_fitness': 'general_fitness'
    }

    const equipmentMapping = {
      'full_gym': 'full_gym',
      'home_gym': 'home_gym',
      'minimal': 'minimal',
      'bodyweight_only': 'bodyweight',
      'none': 'none'
    }

    const mappedFitnessGoal = fitnessGoalMapping[assessmentData.fitnessGoal] || 'general_fitness'
    const mappedEquipment = equipmentMapping[assessmentData.equipment] || 'minimal'

    // Update user profile to mark assessment as completed
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

    console.log('Updated profile successfully')

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
        message: 'NEW MUSCLE! fitness plan generated and stored successfully',
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
