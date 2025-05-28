
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, Play, Pause, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";

interface RestTimerOverlayProps {
  isVisible: boolean;
  duration: number;
  onComplete: () => void;
  onSkip: () => void;
  onClose: () => void;
  className?: string;
}

export function RestTimerOverlay({ 
  isVisible, 
  duration, 
  onComplete, 
  onSkip, 
  onClose,
  className 
}: RestTimerOverlayProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isPaused, setIsPaused] = useState(false);
  
  useEffect(() => {
    if (isVisible) {
      setTimeLeft(duration);
      setIsPaused(false);
    }
  }, [isVisible, duration]);
  
  useEffect(() => {
    if (!isVisible || isPaused || timeLeft <= 0) return;
    
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isVisible, isPaused, timeLeft, onComplete]);
  
  if (!isVisible) return null;
  
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((duration - timeLeft) / duration) * 100;
  
  return (
    <div className={cn(
      "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in",
      className
    )}>
      <Card className="p-6 mx-4 w-full max-w-sm text-center space-y-4 animate-scale-in">
        <div className="space-y-2">
          <Clock className="h-8 w-8 mx-auto text-hashim-600" />
          <h3 className="text-lg font-semibold">Rest Time</h3>
        </div>
        
        <div className="space-y-4">
          <div className="text-4xl font-bold text-hashim-600">
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-hashim-500 to-hashim-600 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsPaused(!isPaused)}
            className="flex-1"
          >
            {isPaused ? <Play size={16} /> : <Pause size={16} />}
            {isPaused ? "Resume" : "Pause"}
          </Button>
          
          <Button
            onClick={onSkip}
            className="flex-1 bg-hashim-600 hover:bg-hashim-700"
          >
            <SkipForward size={16} className="mr-1" />
            Skip
          </Button>
        </div>
        
        <Button
          variant="ghost"
          onClick={onClose}
          className="w-full text-muted-foreground"
        >
          Close
        </Button>
      </Card>
    </div>
  );
}
