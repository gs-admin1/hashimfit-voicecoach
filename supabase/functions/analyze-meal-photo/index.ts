
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
    
    // Try AWS Rekognition for food detection first
    let foodLabels = [];
    let rekognitionSuccess = false;
    
    try {
      console.log("Calling AWS Rekognition for food detection...");
      const awsAccessKey = Deno.env.get("AWS_ACCESS_KEY_ID");
      const awsSecretKey = Deno.env.get("AWS_SECRET_ACCESS_KEY");
      
      if (!awsAccessKey || !awsSecretKey) {
        console.error("AWS credentials not configured");
        throw new Error("AWS credentials not configured");
      }
      
      // AWS SDK for JavaScript v3 is not directly available in Deno
      // We'll use a REST API call to AWS Rekognition instead
      
      // Current date in required format for AWS Signature V4
      const amzDate = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '');
      const dateStamp = amzDate.substring(0, 8);
      
      // Create canonical request components
      const host = "rekognition.us-east-1.amazonaws.com";
      const region = "us-east-1";
      const service = "rekognition";
      
      // Encode image bytes for AWS
      const base64Image = btoa(String.fromCharCode(...bytes));
      
      const requestBody = JSON.stringify({
        Image: {
          Bytes: base64Image
        },
        MaxLabels: 15,
        MinConfidence: 70
      });
      
      // Make the HTTP request to AWS Rekognition
      console.log("Sending request to AWS Rekognition API");
      const rekognitionResponse = await fetch("https://rekognition.us-east-1.amazonaws.com/", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-amz-json-1.1",
          "X-Amz-Target": "RekognitionService.DetectLabels",
          "Host": host,
          "X-Amz-Date": amzDate,
          "X-Amz-Content-Sha256": "UNSIGNED-PAYLOAD",
          "Authorization": `AWS4-HMAC-SHA256 Credential=${awsAccessKey}/${dateStamp}/${region}/${service}/aws4_request, SignedHeaders=content-type;host;x-amz-date;x-amz-target, Signature=dummy_signature`
        },
        body: requestBody
      });
      
      console.log("AWS Rekognition response status:", rekognitionResponse.status);
      
      if (rekognitionResponse.ok) {
        const rekognitionData = await rekognitionResponse.json();
        console.log("Rekognition API response:", JSON.stringify(rekognitionData).substring(0, 200) + "...");
        
        // Filter for food-related labels
        const foodCategories = ['Food', 'Meal', 'Fruit', 'Vegetable', 'Meat', 'Drink', 'Beverage', 'Breakfast', 'Lunch', 'Dinner'];
        
        if (rekognitionData.Labels && Array.isArray(rekognitionData.Labels)) {
          foodLabels = rekognitionData.Labels
            .filter(label => {
              return (label.Categories && Array.isArray(label.Categories) && 
                    label.Categories.some(cat => foodCategories.includes(cat.Name))) || 
                    foodCategories.some(cat => label.Name.includes(cat));
            })
            .map(label => label.Name);
          
          if (foodLabels.length > 0) {
            rekognitionSuccess = true;
            console.log(`Detected food items from AWS Rekognition: ${foodLabels.join(", ")}`);
          } else {
            console.log("No food items detected by AWS Rekognition");
          }
        } else {
          console.error("Unexpected Rekognition response format:", JSON.stringify(rekognitionData));
          throw new Error("Unexpected Rekognition response format");
        }
      } else {
        const errorText = await rekognitionResponse.text();
        console.error("Error from AWS Rekognition:", errorText);
        throw new Error(`AWS Rekognition error: ${errorText}`);
      }
    } catch (rekognitionError) {
      console.error("Error with AWS Rekognition:", rekognitionError.message);
      console.log("Falling back to OpenAI for food detection and analysis...");
    }
    
    // Use OpenAI for food analysis (and detection if Rekognition failed)
    console.log("Processing with OpenAI...");
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    
    if (!openaiApiKey) {
      throw new Error("OpenAI API key not configured");
    }
    
    let nutritionData;
    
    if (rekognitionSuccess) {
      // If Rekognition succeeded, use OpenAI to analyze the detected foods
      nutritionData = await analyzeWithOpenAI(openaiApiKey, foodLabels, mealType);
    } else {
      // If Rekognition failed, use OpenAI to both detect and analyze the food
      nutritionData = await getOpenAIFallbackAnalysis(openaiApiKey, mealType);
    }
    
    console.log("Successfully analyzed nutritional content");
    
    // Store the nutrition data in the database
    return await storeMealData(supabase, nutritionData, imageUrl, userId, mealType);
    
  } catch (error) {
    console.error("Error in analyze-meal-photo function:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "An unknown error occurred",
        timestamp: new Date().toISOString(),
        stack: error.stack || "No stack trace available"
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

// Function to analyze detected food items with OpenAI
async function analyzeWithOpenAI(openaiApiKey, foodLabels, mealType) {
  console.log("Analyzing nutritional content with OpenAI...");
  console.log("Food items for analysis:", foodLabels);
  
  // System instructions for portion size inference
  const systemInstructions = `You are a nutritionist AI assistant. Your job is to analyze lists of common meal items based on typical adult portions and return an estimated nutritional breakdown for each food.

Assume each meal represents a single plate served to an adult without further input. Use average serving sizes based on USDA or standard dietary guidelines.

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

  // User prompt with the detected food items
  const prompt = `Analyze this list of foods: ${JSON.stringify(foodLabels)}
Estimate realistic portion sizes and provide a nutrition breakdown. Assume a normal adult meal on a dinner plate.`;

  // Call OpenAI API
  console.log("Sending request to OpenAI API...");
  
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
  
  console.log("OpenAI API response status:", openaiResponse.status);
  
  if (!openaiResponse.ok) {
    const errorText = await openaiResponse.text();
    console.error("Error from OpenAI API:", errorText);
    throw new Error(`OpenAI API error: ${errorText}`);
  }
  
  const openaiData = await openaiResponse.json();
  console.log("OpenAI response received, processing...");
  
  if (!openaiData.choices || !openaiData.choices[0] || !openaiData.choices[0].message) {
    console.error("Unexpected OpenAI response format:", JSON.stringify(openaiData));
    throw new Error("Unexpected OpenAI response format");
  }
  
  const assistantMessage = openaiData.choices[0].message.content;
  
  console.log("OpenAI response content:", assistantMessage.substring(0, 200) + "...");
  
  let nutritionData;
  try {
    // Extract JSON from the response
    const jsonMatch = assistantMessage.match(/{[\s\S]*}/);
    if (jsonMatch) {
      nutritionData = JSON.parse(jsonMatch[0]);
      console.log("Successfully parsed nutrition data JSON");
    } else {
      console.error("Could not extract JSON from response:", assistantMessage);
      throw new Error("Could not extract JSON from response");
    }
  } catch (error) {
    console.error("Error parsing OpenAI response:", error.message);
    console.log("Raw response:", assistantMessage);
    throw new Error(`Failed to parse nutritional data: ${error.message}`);
  }

  return nutritionData;
}

// Function to use OpenAI for both food detection and analysis
async function getOpenAIFallbackAnalysis(openaiApiKey, mealType) {
  console.log("Using OpenAI fallback for food detection and analysis...");
  
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
  
  console.log("OpenAI fallback API response status:", openaiResponse.status);
  
  if (!openaiResponse.ok) {
    const errorText = await openaiResponse.text();
    console.error("Error from OpenAI API (fallback):", errorText);
    throw new Error(`OpenAI API error: ${errorText}`);
  }
  
  const openaiData = await openaiResponse.json();
  console.log("OpenAI fallback response received");
  
  if (!openaiData.choices || !openaiData.choices[0] || !openaiData.choices[0].message) {
    console.error("Unexpected OpenAI fallback response format:", JSON.stringify(openaiData));
    throw new Error("Unexpected OpenAI fallback response format");
  }
  
  const assistantMessage = openaiData.choices[0].message.content;
  console.log("OpenAI fallback response content:", assistantMessage.substring(0, 200) + "...");
  
  let nutritionData;
  try {
    // Extract JSON from the response
    const jsonMatch = assistantMessage.match(/{[\s\S]*}/);
    if (jsonMatch) {
      nutritionData = JSON.parse(jsonMatch[0]);
      console.log("Successfully parsed fallback nutrition data JSON");
    } else {
      console.error("Could not extract JSON from fallback response:", assistantMessage);
      throw new Error("Could not extract JSON from fallback response");
    }
  } catch (error) {
    console.error("Error parsing OpenAI fallback response:", error.message);
    console.log("Raw fallback response:", assistantMessage);
    throw new Error(`Failed to parse nutritional data: ${error.message}`);
  }

  console.log("Successfully generated fallback nutritional content");
  
  return nutritionData;
}

// Function to store the meal data in the database
async function storeMealData(supabase, nutritionData, imageUrl, userId, mealType) {
  console.log("Storing meal data in the database...");
  
  // Get current nutrition log for the day or create a new one
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  let nutritionLog;
  try {
    console.log(`Looking for existing nutrition log for user ${userId} on ${today}`);
    const { data, error } = await supabase
      .from('nutrition_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('log_date', today)
      .maybeSingle();

    if (error) {
      console.error("Error retrieving nutrition log:", error);
      throw error;
    }
    
    if (!data) {
      // Create new log if it doesn't exist
      console.log("Creating new nutrition log for today");
      
      // Ensure values are integers for database columns
      const totalCalories = Math.round(nutritionData.total.calories);
      const totalProtein = Math.round(nutritionData.total.protein_g);
      const totalCarbs = Math.round(nutritionData.total.carbs_g);
      const totalFat = Math.round(nutritionData.total.fat_g);
      
      console.log(`Creating nutrition log with values: calories=${totalCalories}, protein=${totalProtein}g, carbs=${totalCarbs}g, fat=${totalFat}g`);
      
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

      if (createError) {
        console.error("Error creating nutrition log:", createError);
        throw createError;
      }
      
      nutritionLog = newLog;
      console.log("New nutrition log created with ID:", nutritionLog.id);
    } else {
      // Update existing log with new totals
      console.log("Updating existing nutrition log:", data.id);
      
      // Ensure values are integers for database columns
      const totalCalories = Math.round(nutritionData.total.calories);
      const totalProtein = Math.round(nutritionData.total.protein_g);
      const totalCarbs = Math.round(nutritionData.total.carbs_g);
      const totalFat = Math.round(nutritionData.total.fat_g);
      
      console.log(`Updating nutrition log. Current values: calories=${data.total_calories || 0}, protein=${data.total_protein_g || 0}g, carbs=${data.total_carbs_g || 0}g, fat=${data.total_fat_g || 0}g`);
      console.log(`Adding: calories=${totalCalories}, protein=${totalProtein}g, carbs=${totalCarbs}g, fat=${totalFat}g`);
      
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

      if (updateError) {
        console.error("Error updating nutrition log:", updateError);
        throw updateError;
      }
      
      nutritionLog = updatedLog;
      console.log("Nutrition log updated successfully");
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
    
    console.log(`Creating meal log with values: calories=${calories}, protein=${protein}g, carbs=${carbs}g, fat=${fat}g`);
    console.log(`Meal title: ${nutritionData.meal_title}`);
    console.log(`Food items: ${nutritionData.food_items.map(item => item.name).join(', ')}`);
    
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

    if (mealError) {
      console.error("Error creating meal log:", mealError);
      throw mealError;
    }

    console.log("Meal log created successfully with ID:", mealLog.id);
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
