
import supabase from '@/lib/supabase';
import { ChatMessage } from '../services/ChatService';

interface ChatRequestBody {
  message: string;
}

interface ChatResponseBody {
  message: string;
}

export async function sendChatMessage(message: string): Promise<string> {
  try {
    console.log('Sending message to OpenAI Assistant via Edge Function');
    const { data, error } = await supabase.functions.invoke<ChatResponseBody>('ai-chat', {
      body: { message } as ChatRequestBody,
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(error.message);
    }
    
    if (!data) {
      console.error('No response from AI chat function');
      throw new Error('No response from AI chat function');
    }
    
    console.log('Received response from OpenAI Assistant');
    return data.message;
  } catch (error) {
    console.error('Error calling AI chat function:', error);
    throw error;
  }
}
