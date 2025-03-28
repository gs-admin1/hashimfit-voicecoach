
import { useState, useRef, useEffect } from "react";
import { X, Send, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { AnimatedCard } from "./ui-components";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ChatService, ChatMessage } from "@/lib/supabase/services/ChatService";

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatInterface({ isOpen, onClose }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      user_id: "",
      content: "Hello! I'm your AI fitness assistant. How can I help you today?",
      role: "assistant",
      created_at: new Date().toISOString()
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, userId } = useAuth();

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    // Load chat history from Supabase when authenticated
    if (isAuthenticated && userId && isOpen) {
      fetchChatHistory();
    }
  }, [isAuthenticated, userId, isOpen]);

  const fetchChatHistory = async () => {
    if (!userId) return;
    
    try {
      const chatHistory = await ChatService.getChatHistory(userId, 50);
      
      if (chatHistory && chatHistory.length > 0) {
        setMessages([
          {
            id: "welcome",
            user_id: userId,
            content: "Hello! I'm your AI fitness assistant. How can I help you today?",
            role: "assistant",
            created_at: new Date().toISOString()
          },
          ...chatHistory
        ]);
      }
    } catch (error) {
      console.error('Error in fetchChatHistory:', error);
    }
  };

  // Set up real-time subscription for new messages
  useEffect(() => {
    let unsubscribe: () => void;

    if (isAuthenticated && userId) {
      unsubscribe = ChatService.subscribeToNewMessages(userId, (newMessage) => {
        // Only add the message if it's not already in the list
        setMessages(prevMessages => {
          if (!prevMessages.some(msg => msg.id === newMessage.id)) {
            return [...prevMessages, newMessage];
          }
          return prevMessages;
        });
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isAuthenticated, userId]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    if (!userId) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use the chat feature.",
        variant: "destructive"
      });
      return;
    }

    // Create user message
    const userMessage: ChatMessage = {
      user_id: userId,
      content: input,
      role: "user",
      created_at: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Save user message to Supabase
      await ChatService.saveChatMessage(userMessage);

      // This would ideally call your Supabase Edge function, but for now let's use the fallback
      setTimeout(async () => {
        const fitnessTips = [
          "Try to get at least 150 minutes of moderate aerobic activity or 75 minutes of vigorous aerobic activity a week.",
          "Strength training exercises for all major muscle groups at least twice a week.",
          "Drink water before, during, and after your workout.",
          "Get adequate sleep to allow your body to recover and repair.",
          "Include a mix of cardio, strength, flexibility, and balance exercises in your routine.",
          "Start slowly and gradually increase the intensity of your workouts.",
          "Listen to your body and rest when needed.",
          "Proper form prevents injuries. Consider working with a trainer initially.",
          "Set specific, measurable, achievable, relevant, and time-bound (SMART) goals.",
        ];

        const randomResponse = fitnessTips[Math.floor(Math.random() * fitnessTips.length)];

        const assistantMessage: ChatMessage = {
          user_id: userId,
          content: randomResponse,
          role: "assistant",
          created_at: new Date().toISOString()
        };

        // Save assistant message to Supabase
        await ChatService.saveChatMessage(assistantMessage);
        
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error in chat flow:', error);
      toast({
        title: "Error",
        description: "Failed to process your message. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 animate-fade-in flex items-end sm:items-center justify-center">
      <AnimatedCard className="w-full max-w-md mx-4 sm:mx-auto h-[70vh] max-h-[600px] flex flex-col p-0 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold text-lg">Fitness Assistant</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full h-8 w-8"
          >
            <X size={18} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-hashim-600 text-white rounded-tr-none"
                    : "bg-muted rounded-tl-none"
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] p-3 rounded-lg bg-muted rounded-tl-none">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about fitness, nutrition, or workouts..."
              className="flex-1"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
              className={`rounded-full h-10 w-10 ${
                input.trim() ? "bg-hashim-600 hover:bg-hashim-700" : ""
              }`}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </Button>
          </form>
        </div>
      </AnimatedCard>
    </div>
  );
}
