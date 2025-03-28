
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
    const { data, error } = await supabase.functions.invoke<ChatResponseBody>('ai-chat', {
      body: { message } as ChatRequestBody,
    });

    if (error) throw new Error(error.message);
    if (!data) throw new Error('No response from AI chat function');
    
    return data.message;
  } catch (error) {
    console.error('Error calling AI chat function:', error);
    throw error;
  }
}
