
import supabase from '@/lib/supabase';

export interface ChatMessage {
  id?: string;
  user_id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at?: string;
  referenced_workout_id?: string;
  referenced_nutrition_id?: string;
  referenced_metric_id?: string;
  referenced_assessment_id?: string;
  ai_response_id?: string;
  ai_prompt_tokens?: number;
  ai_completion_tokens?: number;
}

export class ChatService {
  static async getChatHistory(userId: string, limit: number = 50): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(limit);
        
      if (error) throw error;
      return data as ChatMessage[];
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return [];
    }
  }

  static async saveChatMessage(message: ChatMessage): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([message])
        .select()
        .single();
        
      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error saving chat message:', error);
      return null;
    }
  }

  // Changed return type to be synchronous
  static subscribeToNewMessages(userId: string, callback: (message: ChatMessage) => void): () => void {
    const subscription = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new as ChatMessage);
        }
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      subscription.unsubscribe();
    };
  }
}
