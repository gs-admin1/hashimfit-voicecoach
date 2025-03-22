
import { useState, useRef, useEffect } from "react";
import { BrainCog, Send, X } from "lucide-react";
import { AnimatedCard } from "./ui-components";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export function ChatInterface({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hello! I'm your fitness AI assistant. How can I help you with your fitness journey today?",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    try {
      // Here you would make an API call to your backend
      // This is where you'd send the last 9 messages + current input to OpenAI
      // For now, we'll simulate a response
      
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "This is a simulated AI response. Connect to Supabase and OpenAI to get real responses about your fitness questions!",
          role: "assistant",
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error("Error sending message:", error);
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-full max-w-[350px] shadow-xl animate-slide-in">
      <AnimatedCard className="flex flex-col h-[500px] p-0 overflow-hidden">
        <div className="flex items-center justify-between bg-hashim-600 text-white px-4 py-3 rounded-t-2xl">
          <div className="flex items-center">
            <BrainCog className="mr-2" size={20} />
            <h3 className="font-semibold">Fitness AI Assistant</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-hashim-700 rounded-full h-8 w-8 p-0"
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
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  message.role === "user"
                    ? "bg-hashim-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl px-4 py-2 bg-gray-100 dark:bg-gray-800">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 bg-hashim-500 rounded-full animate-bounce"></div>
                  <div className="h-2 w-2 bg-hashim-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="h-2 w-2 bg-hashim-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Textarea
              placeholder="Ask about fitness, nutrition, or workouts..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[60px] max-h-[120px] resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button
              className="self-end"
              size="icon"
              disabled={isLoading || !input.trim()}
              onClick={handleSendMessage}
            >
              <Send size={18} />
            </Button>
          </div>
        </div>
      </AnimatedCard>
    </div>
  );
}
