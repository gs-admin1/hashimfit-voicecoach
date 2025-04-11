
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { AWS } from "https://deno.land/x/aws_js_sdk@v0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { imageUrl, userId, mealType } = await req.json();

    if (!imageUrl || !userId || !mealType) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: imageUrl, userId, and mealType are required" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Processing meal photo for user ${userId}, meal type: ${mealType}`);
    console.log(`Image URL: ${imageUrl}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Configure AWS
    AWS.config.update({
      credentials: {
        accessKeyId: Deno.env.get("AWS_ACCESS_KEY_ID") as string,
        secretAccessKey: Deno.env.get("AWS_SECRET_ACCESS_KEY") as string,
      },
      region: "us-east-1", // Update with your preferred region
    });

    // Download image from Supabase Storage
    console.log("Downloading image from Storage...");
    
    // Extract bucket and path from URL
    // Assuming URL format: https://<project-ref>.supabase.co/storage/v1/object/public/<bucket>/<path>
    const urlParts = imageUrl.split('/storage/v1/object/public/');
    if (urlParts.length < 2) {
      throw new Error("Invalid image URL format");
    }
    
    const pathParts = urlParts[1].split('/', 1);
    const bucket = pathParts[0];
    const path = urlParts[1].substring(bucket.length + 1);
    
    console.log(`Bucket: ${bucket}, Path: ${path}`);
    
    const { data: fileData, error: fileError } = await supabase.storage
      .from(bucket)
      .download(path);
      
    if (fileError) {
      throw new Error(`Failed to download image: ${fileError.message}`);
    }

    // Convert file to base64 for AWS Rekognition
    const arrayBuffer = await fileData.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // Detect foods using AWS Rekognition
    console.log("Sending image to AWS Rekognition for food detection...");
    const rekognition = new AWS.Rekognition();
    const rekognitionResponse = await rekognition.detectLabels({
      Image: {
        Bytes: bytes,
      },
      MaxLabels: 15,
      MinConfidence: 70,
    });

    if (!rekognitionResponse.Labels || rekognitionResponse.Labels.length === 0) {
      throw new Error("No labels detected in the image");
    }

    // Filter food-related labels and extract names
    const foodLabels = rekognitionResponse.Labels
      .filter(label => {
        // Filter for food categories - adjust as needed
        const foodCategories = ['Food', 'Meal', 'Fruit', 'Vegetable', 'Meat', 'Drink', 'Beverage'];
        return label.Categories?.some(cat => foodCategories.includes(cat.Name)) || 
               foodCategories.some(cat => label.Name.includes(cat));
      })
      .map(label => label.Name);

    if (foodLabels.length === 0) {
      throw new Error("No food items detected in the image");
    }

    console.log(`Detected food items: ${foodLabels.join(", ")}`);

    // Analyze nutritional content using OpenAI
    console.log("Analyzing nutritional content with OpenAI...");
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    
    const prompt = `
      Analyze the nutritional content for these foods: ${foodLabels.join(", ")}.
      
      For this meal, provide the following information in JSON format:
      - Total calories
      - Grams of protein
      - Grams of carbohydrates
      - Grams of fat
      - Detailed list of identified food items with individual nutritional values
      
      Format your response as a valid JSON object with the following structure:
      {
        "meal_title": "A descriptive title for this meal",
        "food_items": [
          { "name": "Food 1", "calories": 100, "protein_g": 10, "carbs_g": 10, "fat_g": 5 },
          { "name": "Food 2", "calories": 150, "protein_g": 15, "carbs_g": 20, "fat_g": 5 }
        ],
        "total": {
          "calories": 250,
          "protein_g": 25,
          "carbs_g": 30,
          "fat_g": 10
        }
      }
      
      Provide only the JSON object in your response, no other text.
    `;

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: "You are a nutritional analysis assistant that provides accurate estimates of calories and macronutrients for foods. Respond only with JSON." 
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
      }),
    });

    const openaiData = await openaiResponse.json();
    
    if (!openaiData.choices || openaiData.choices.length === 0) {
      throw new Error("Failed to analyze nutritional content");
    }

    // Parse the JSON response from OpenAI
    let nutritionData;
    try {
      const contentText = openaiData.choices[0].message.content;
      // Extract JSON if it's wrapped in markdown code blocks
      const jsonStr = contentText.includes("```json")
        ? contentText.split("```json")[1].split("```")[0].trim()
        : contentText.includes("```")
          ? contentText.split("```")[1].split("```")[0].trim()
          : contentText;
      
      nutritionData = JSON.parse(jsonStr);
    } catch (error) {
      throw new Error(`Failed to parse nutritional data: ${error.message}`);
    }

    console.log("Successfully analyzed nutritional content");

    // Get current nutrition log for the day or create a new one
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    let { data: nutritionLog, error: logError } = await supabase
      .from('nutrition_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('log_date', today)
      .single();

    if (logError) {
      // Create new log if it doesn't exist
      if (logError.code === 'PGRST116') { // Object not found error
        console.log("Creating new nutrition log for today");
        const { data: newLog, error: createError } = await supabase
          .from('nutrition_logs')
          .insert({
            user_id: userId,
            log_date: today,
            total_calories: nutritionData.total.calories,
            total_protein_g: nutritionData.total.protein_g,
            total_carbs_g: nutritionData.total.carbs_g,
            total_fat_g: nutritionData.total.fat_g,
          })
          .select()
          .single();

        if (createError) {
          throw new Error(`Failed to create nutrition log: ${createError.message}`);
        }
        
        nutritionLog = newLog;
      } else {
        throw new Error(`Error retrieving nutrition log: ${logError.message}`);
      }
    } else {
      // Update existing log with new totals
      console.log("Updating existing nutrition log");
      const { data: updatedLog, error: updateError } = await supabase
        .from('nutrition_logs')
        .update({
          total_calories: (nutritionLog.total_calories || 0) + nutritionData.total.calories,
          total_protein_g: (nutritionLog.total_protein_g || 0) + nutritionData.total.protein_g,
          total_carbs_g: (nutritionLog.total_carbs_g || 0) + nutritionData.total.carbs_g,
          total_fat_g: (nutritionLog.total_fat_g || 0) + nutritionData.total.fat_g,
        })
        .eq('id', nutritionLog.id)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to update nutrition log: ${updateError.message}`);
      }
      
      nutritionLog = updatedLog;
    }

    // Create meal log entry
    console.log("Creating meal log entry");
    const { data: mealLog, error: mealError } = await supabase
      .from('meal_logs')
      .insert({
        nutrition_log_id: nutritionLog.id,
        meal_type: mealType,
        meal_title: nutritionData.meal_title,
        calories: nutritionData.total.calories,
        protein_g: nutritionData.total.protein_g,
        carbs_g: nutritionData.total.carbs_g,
        fat_g: nutritionData.total.fat_g,
        consumed_at: new Date().toISOString(),
        meal_image_url: imageUrl,
        notes: `Auto-detected items: ${foodLabels.join(", ")}`,
      })
      .select()
      .single();

    if (mealError) {
      throw new Error(`Failed to create meal log: ${mealError.message}`);
    }

    console.log("Process completed successfully");
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Food analysis complete",
        nutritionData,
        mealLog,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in analyze-meal-photo function:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "An unknown error occurred",
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
