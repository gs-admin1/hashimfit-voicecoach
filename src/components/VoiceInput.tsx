
import { useState, useEffect } from "react";
import { Mic } from "lucide-react";
import { AnimatedCard } from "./ui-components";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

export function VoiceInput() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [processingDone, setProcessingDone] = useState(false);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    setIsListening(true);
    setTranscript("");
    setProcessingDone(false);

    // Simulate voice recognition
    const messages = [
      "Listening...",
      "I heard: 3 sets of 10 bench press at 80kg",
      "Processing workout...",
      "Workout logged successfully!"
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < messages.length) {
        setTranscript(messages[index]);
        index++;

        // On the last message, we're done processing
        if (index === messages.length) {
          setProcessingDone(true);
          clearInterval(interval);
          
          // Stop listening after processing is complete
          setTimeout(() => {
            setIsListening(false);
            toast({
              title: "Workout logged",
              description: "3 sets of 10 bench press at 80kg added to today's workout",
            });
          }, 1500);
        }
      } else {
        clearInterval(interval);
      }
    }, 1200);
  };

  const stopListening = () => {
    setIsListening(false);
  };

  return (
    <AnimatedCard className="relative overflow-hidden">
      <div className="flex flex-col items-center justify-center py-4">
        <button
          onClick={toggleListening}
          className={cn(
            "relative rounded-full p-6 transition-all duration-300 mb-4",
            isListening 
              ? "bg-hashim-600 microphone-ripple" 
              : "bg-hashim-500 hover:bg-hashim-600",
            processingDone ? "bg-green-500" : ""
          )}
        >
          <Mic 
            className="text-white" 
            size={28} 
          />
          {isListening && (
            <div className="absolute inset-0 rounded-full animate-ripple bg-hashim-500 opacity-20"></div>
          )}
        </button>
        
        <div className="text-center">
          <h3 className="font-bold text-lg mb-1">
            {isListening ? "Listening..." : "Log your workout"}
          </h3>
          <p className="text-muted-foreground text-sm">
            {isListening 
              ? transcript || "Speak now to log your exercise..." 
              : "Tap the microphone and speak clearly"}
          </p>
        </div>
      </div>
    </AnimatedCard>
  );
}
