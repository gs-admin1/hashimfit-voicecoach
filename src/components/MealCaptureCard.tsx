
import { useState } from "react";
import { Camera } from "lucide-react";
import { AnimatedCard } from "./ui-components";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

export function MealCaptureCard() {
  const [isCapturing, setIsCapturing] = useState(false);
  
  const handleCaptureMeal = () => {
    setIsCapturing(true);
    
    // Simulate capture process
    setTimeout(() => {
      setIsCapturing(false);
      toast({
        title: "Meal captured",
        description: "Your meal was successfully captured. Calculating nutritional info...",
      });
      
      // Simulate analysis completion
      setTimeout(() => {
        toast({
          title: "Analysis complete",
          description: "Protein: 25g, Carbs: 40g, Fat: 12g, Calories: 370",
        });
      }, 2000);
    }, 1500);
  };

  return (
    <AnimatedCard className="relative overflow-hidden">
      <div className="flex flex-col items-center justify-center py-4">
        <button
          onClick={handleCaptureMeal}
          className={cn(
            "relative rounded-full p-6 transition-all duration-300 mb-4",
            isCapturing 
              ? "bg-hashim-600 microphone-ripple" 
              : "bg-hashim-500 hover:bg-hashim-600"
          )}
        >
          <Camera 
            className="text-white" 
            size={28} 
          />
          {isCapturing && (
            <div className="absolute inset-0 rounded-full animate-ripple bg-hashim-500 opacity-20"></div>
          )}
        </button>
        
        <div className="text-center">
          <h3 className="font-bold text-lg mb-1">
            {isCapturing ? "Capturing..." : "Snap a Snack"}
          </h3>
          <p className="text-muted-foreground text-sm">
            {isCapturing 
              ? "Analyzing your meal..." 
              : "Capture your meal for nutritional info"}
          </p>
        </div>
      </div>
    </AnimatedCard>
  );
}
