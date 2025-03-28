
// Example Supabase Edge Function for AI Chat

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing Authorization header')
    }

    const supabaseClient = createClient(
      // Supabase API URL - env var exposed by default.
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase API ANON KEY - env var exposed by default.
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      // Create client with Auth header of the user that called the function.
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    )

    // Get logged in user data
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      throw new Error('No user found')
    }

    // Get the request body
    const { message } = await req.json()
    
    // Get any secrets from the environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    
    if (!openaiApiKey) {
      throw new Error('Missing OpenAI API Key')
    }

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
            content: `You are an AI fitness assistant. You help users with workout recommendations, nutrition advice, and general fitness guidance. Focus on being supportive, motivational, and providing scientifically accurate information.
            
            About the user:
            - User ID: ${user.id}
            - Email: ${user.email}
            
            Keep responses concise, helpful, and tailored to fitness contexts.`
          },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    })

    const openAIData = await openAIResponse.json()
    
    // Get the assistant response
    const assistantResponse = openAIData.choices[0].message.content
    
    // Log the chat message to the database
    const { data: userMessageData, error: userMessageError } = await supabaseClient
      .from('chat_messages')
      .insert({
        user_id: user.id,
        content: message,
        role: 'user',
        created_at: new Date().toISOString(),
      })
      .select()
      .single()
    
    if (userMessageError) throw userMessageError
    
    // Log the AI response
    const { data: aiMessageData, error: aiMessageError } = await supabaseClient
      .from('chat_messages')
      .insert({
        user_id: user.id,
        content: assistantResponse,
        role: 'assistant',
        created_at: new Date().toISOString(),
        ai_prompt_tokens: openAIData.usage.prompt_tokens,
        ai_completion_tokens: openAIData.usage.completion_tokens
      })
      .select()
      .single()
    
    if (aiMessageError) throw aiMessageError

    return new Response(
      JSON.stringify({
        message: assistantResponse,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
