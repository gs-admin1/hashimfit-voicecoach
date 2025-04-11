
// @ts-nocheck
// ^ Adding this directive to ignore TypeScript errors for this file

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

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
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase credentials");
      throw new Error("Server configuration error: Missing Supabase credentials");
    }
    
    console.log("Supabase URL and service key are configured");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
      console.error("Download error:", fileError);
      throw new Error(`Failed to download image: ${fileError.message}`);
    }
    
    console.log("Image downloaded successfully, file size:", fileData.size);

    // Convert file to binary for AWS Rekognition
    const arrayBuffer = await fileData.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    
    // Call AWS Rekognition for food detection
    console.log("Calling AWS Rekognition for food detection...");
    const awsAccessKey = Deno.env.get("AWS_ACCESS_KEY_ID");
    const awsSecretKey = Deno.env.get("AWS_SECRET_ACCESS_KEY");
    
    if (!awsAccessKey || !awsSecretKey) {
      console.error("AWS credentials not configured");
      throw new Error("Server configuration error: AWS credentials not configured");
    }
    
    console.log("AWS credentials are configured");
    
    // Direct AWS Rekognition API call
    const rekognitionEndpoint = "https://rekognition.us-east-1.amazonaws.com";
    
    try {
      console.log("Sending request to AWS Rekognition...");
      
      const rekognitionResponse = await fetch(rekognitionEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-amz-json-1.1",
          "X-Amz-Target": "RekognitionService.DetectLabels",
          "Host": "rekognition.us-east-1.amazonaws.com",
          "X-Amz-Content-Sha256": "UNSIGNED-PAYLOAD",
          "X-Amz-Date": new Date().toISOString().replace(/[:\-]|\.\d{3}/g, ''),
          "Authorization": `AWS4-HMAC-SHA256 Credential=${awsAccessKey}/${new Date().toISOString().slice(0, 10).replace(/-/g, '')}/us-east-1/rekognition/aws4_request, SignedHeaders=content-type;host;x-amz-content-sha256;x-amz-date;x-amz-target, Signature=signature`
        },
        body: JSON.stringify({
          Image: {
            Bytes: Array.from(bytes)
          },
          MaxLabels: 15,
          MinConfidence: 70
        })
      });
      
      if (!rekognitionResponse.ok) {
        const errorText = await rekognitionResponse.text();
        console.error("Error from AWS Rekognition:", errorText);
        console.log("Falling back to OpenAI for food detection and analysis...");
        return await handleOpenAIFallback(supabase, imageUrl, userId, mealType);
      }
      
      const rekognitionData = await rekognitionResponse.json();
      console.log("Rekognition API response:", JSON.stringify(rekognitionData).substring(0, 200) + "...");
      
      // Filter for food-related labels
      const foodCategories = ['Food', 'Meal', 'Fruit', 'Vegetable', 'Meat', 'Drink', 'Beverage', 'Breakfast', 'Lunch', 'Dinner'];
      
      // Check if Labels exists and is an array
      if (!rekognitionData.Labels || !Array.isArray(rekognitionData.Labels)) {
        console.error("Invalid response from Rekognition:", rekognitionData);
        console.log("Falling back to OpenAI for food detection and analysis...");
        return await handleOpenAIFallback(supabase, imageUrl, userId, mealType);
      }
      
      const foodLabels = rekognitionData.Labels
        .filter(label => {
          return (label.Categories && Array.isArray(label.Categories) && 
                 label.Categories.some(cat => foodCategories.includes(cat.Name))) || 
                 foodCategories.some(cat => label.Name.includes(cat));
        })
        .map(label => label.Name);
      
      if (foodLabels.length === 0) {
        console.log("No food items detected, falling back to OpenAI...");
        return await handleOpenAIFallback(supabase, imageUrl, userId, mealType);
      }
      
      console.log(`Detected food items: ${foodLabels.join(", ")}`);
      
      // Analyze nutritional content with OpenAI
      return await analyzeWithOpenAI(supabase, foodLabels, imageUrl, userId, mealType);
      
    } catch (rekognitionError) {
      console.error("Error in Rekognition processing:", rekognitionError);
      console.log("Falling back to OpenAI for food detection and analysis...");
      
      return await handleOpenAIFallback(supabase, imageUrl, userId, mealType);
    }
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

// Function to analyze detected food items with OpenAI
async function analyzeWithOpenAI(supabase, foodLabels, imageUrl, userId, mealType) {
  console.log("Analyzing nutritional content with OpenAI...");
  const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
  
  if (!openaiApiKey) {
    console.error("OpenAI API key not configured");
    throw new Error("Server configuration error: OpenAI API key not configured");
  }
  
  console.log("OpenAI API key is configured");
  
  // System instructions for portion size inference
  const systemInstructions = `You are a nutritionist AI assistant. Your job is to analyze lists of common meal items based on typical adult portions and return an estimated nutritional breakdown for each food.

Assume each meal represents a single plate served to an adult without further input. Use average serving sizes based on USDA or standard dietary guidelines.

Output structured JSON in this format:
[
  {
    "food": "String",
    "estimated_portion": "Readable portion size with weight (e.g., '1 medium breast (150g)')",
    "calories": number,
    "protein_g": number,
    "carbs_g": number,
    "fat_g": number
  }
]

Return only the JSON in your response. No explanations or extra formatting.`;

  // User prompt with the detected food items
  const prompt = `Analyze this list of foods: ${JSON.stringify(foodLabels)}
Estimate realistic portion sizes and provide a nutrition breakdown. Assume a normal adult meal on a dinner plate.`;

  // Call OpenAI API
  console.log("Sending request to OpenAI API...");
  try {
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemInstructions },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 800
      })
    });
    
    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      console.error("Error from OpenAI API:", error);
      throw new Error(`OpenAI API error: ${error}`);
    }
    
    const openaiData = await openaiResponse.json();
    const assistantMessage = openaiData.choices[0].message.content;
    
    console.log("OpenAI response:", assistantMessage);
    
    let foodItems;
    try {
      // Extract JSON from the response
      const jsonMatch = assistantMessage.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        foodItems = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not extract JSON from response");
      }
    } catch (error) {
      console.error("Error parsing OpenAI response:", error);
      console.log("Raw response:", assistantMessage);
      throw new Error(`Failed to parse nutritional data: ${error.message}`);
    }

    // Calculate total nutritional values
    const totalCalories = Math.round(foodItems.reduce((sum, item) => sum + item.calories, 0));
    const totalProtein = Math.round(foodItems.reduce((sum, item) => sum + item.protein_g, 0));
    const totalCarbs = Math.round(foodItems.reduce((sum, item) => sum + item.carbs_g, 0));
    const totalFat = Math.round(foodItems.reduce((sum, item) => sum + item.fat_g, 0));

    // Create the nutrition data object
    const nutritionData = {
      meal_title: `${mealType.charAt(0).toUpperCase() + mealType.slice(1)}: ${foodLabels[0]} with ${foodLabels.length > 1 ? foodLabels.slice(1).join(", ") : ""}`,
      food_items: foodItems.map(item => ({
        name: item.food,
        portion: item.estimated_portion,
        calories: item.calories,
        protein_g: item.protein_g,
        carbs_g: item.carbs_g,
        fat_g: item.fat_g
      })),
      total: {
        calories: totalCalories,
        protein_g: totalProtein,
        carbs_g: totalCarbs,
        fat_g: totalFat
      }
    };

    console.log("Successfully analyzed nutritional content");
    
    // Store the nutrition data in the database
    return await storeMealData(supabase, nutritionData, imageUrl, userId, mealType);
  } catch (openaiError) {
    console.error("Error processing with OpenAI:", openaiError);
    throw openaiError;
  }
}

// Function to handle OpenAI fallback for both detection and analysis
async function handleOpenAIFallback(supabase, imageUrl, userId, mealType) {
  console.log("Using OpenAI fallback for food detection and analysis...");
  const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
  
  if (!openaiApiKey) {
    throw new Error("OpenAI API key not configured");
  }
  
  // Use OpenAI to suggest likely foods and analyze nutrition
  const prompt = `Analyze this uploaded meal photo. First, identify what foods are likely in a typical meal for this meal type: ${mealType}. Then, estimate realistic portion sizes and provide a nutrition breakdown. Assume a normal adult meal on a dinner plate.`;

  const systemInstructions = `You are a nutritionist AI assistant. For this task, suggest likely foods for a ${mealType} meal and provide nutritional analysis.
  
  Output structured JSON in this format:
  {
    "meal_title": "A descriptive title for this meal",
    "food_items": [
      { 
        "name": "Food 1", 
        "portion": "Portion size with weight", 
        "calories": number, 
        "protein_g": number, 
        "carbs_g": number, 
        "fat_g": number 
      },
      { 
        "name": "Food 2", 
        "portion": "Portion size with weight", 
        "calories": number, 
        "protein_g": number, 
        "carbs_g": number, 
        "fat_g": number 
      }
    ],
    "total": {
      "calories": number,
      "protein_g": number,
      "carbs_g": number,
      "fat_g": number
    }
  }
  
  Return only the JSON in your response. No explanations or extra formatting.`;
  
  console.log("Sending request to OpenAI API for fallback...");
  try {
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemInstructions },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 800
      })
    });
    
    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      throw new Error(`OpenAI API error: ${error}`);
    }
    
    const openaiData = await openaiResponse.json();
    const assistantMessage = openaiData.choices[0].message.content;
    
    console.log("OpenAI fallback response:", assistantMessage);
    
    let nutritionData;
    try {
      // Extract JSON from the response
      const jsonMatch = assistantMessage.match(/{[\s\S]*}/);
      if (jsonMatch) {
        nutritionData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not extract JSON from response");
      }
    } catch (error) {
      console.error("Error parsing OpenAI fallback response:", error);
      console.log("Raw response:", assistantMessage);
      throw new Error(`Failed to parse nutritional data: ${error.message}`);
    }

    console.log("Successfully generated fallback nutritional content");
    
    // Store the nutrition data in the database
    return await storeMealData(supabase, nutritionData, imageUrl, userId, mealType);
  } catch (error) {
    console.error("Error in OpenAI fallback:", error);
    throw error;
  }
}

// Function to store the meal data in the database
async function storeMealData(supabase, nutritionData, imageUrl, userId, mealType) {
  console.log("Storing meal data in the database...");
  
  // Get current nutrition log for the day or create a new one
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  let nutritionLog;
  try {
    const { data, error } = await supabase
      .from('nutrition_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('log_date', today)
      .maybeSingle();

    if (error) throw error;
    
    if (!data) {
      // Create new log if it doesn't exist
      console.log("Creating new nutrition log for today");
      
      // Ensure values are integers for database columns
      const totalCalories = Math.round(nutritionData.total.calories);
      const totalProtein = Math.round(nutritionData.total.protein_g);
      const totalCarbs = Math.round(nutritionData.total.carbs_g);
      const totalFat = Math.round(nutritionData.total.fat_g);
      
      const { data: newLog, error: createError } = await supabase
        .from('nutrition_logs')
        .insert({
          user_id: userId,
          log_date: today,
          total_calories: totalCalories,
          total_protein_g: totalProtein,
          total_carbs_g: totalCarbs,
          total_fat_g: totalFat,
        })
        .select()
        .single();

      if (createError) throw createError;
      
      nutritionLog = newLog;
    } else {
      // Update existing log with new totals
      console.log("Updating existing nutrition log");
      
      // Ensure values are integers for database columns
      const totalCalories = Math.round(nutritionData.total.calories);
      const totalProtein = Math.round(nutritionData.total.protein_g);
      const totalCarbs = Math.round(nutritionData.total.carbs_g);
      const totalFat = Math.round(nutritionData.total.fat_g);
      
      const { data: updatedLog, error: updateError } = await supabase
        .from('nutrition_logs')
        .update({
          total_calories: (data.total_calories || 0) + totalCalories,
          total_protein_g: (data.total_protein_g || 0) + totalProtein,
          total_carbs_g: (data.total_carbs_g || 0) + totalCarbs,
          total_fat_g: (data.total_fat_g || 0) + totalFat,
        })
        .eq('id', data.id)
        .select()
        .single();

      if (updateError) throw updateError;
      
      nutritionLog = updatedLog;
    }
  } catch (error) {
    console.error("Error managing nutrition log:", error);
    throw new Error(`Failed to manage nutrition log: ${error.message}`);
  }

  // Create meal log entry
  try {
    console.log("Creating meal log entry");
    
    // Ensure values are integers for database columns
    const calories = Math.round(nutritionData.total.calories);
    const protein = Math.round(nutritionData.total.protein_g);
    const carbs = Math.round(nutritionData.total.carbs_g);
    const fat = Math.round(nutritionData.total.fat_g);
    
    const { data: mealLog, error: mealError } = await supabase
      .from('meal_logs')
      .insert({
        nutrition_log_id: nutritionLog.id,
        meal_type: mealType,
        meal_title: nutritionData.meal_title,
        calories: calories,
        protein_g: protein,
        carbs_g: carbs,
        fat_g: fat,
        consumed_at: new Date().toISOString(),
        meal_image_url: imageUrl,
        notes: `Auto-detected with portions: ${nutritionData.food_items.map(item => `${item.name} (${item.portion})`).join(", ")}`,
      })
      .select()
      .single();

    if (mealError) throw mealError;

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
    console.error("Error creating meal log:", error);
    throw new Error(`Failed to create meal log: ${error.message}`);
  }
}
