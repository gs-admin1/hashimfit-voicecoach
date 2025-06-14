
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, MessageCircle, Heart } from "lucide-react";

interface PostWorkoutFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitFeedback: (feedback: { mood: number; notes: string }) => void;
  workoutTitle: string;
}

export function PostWorkoutFeedbackModal({ 
  isOpen, 
  onClose, 
  onSubmitFeedback,
  workoutTitle 
}: PostWorkoutFeedbackModalProps) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  const moods = [
    { value: 1, emoji: "😫", label: "Tough" },
    { value: 2, emoji: "😐", label: "Okay" },
    { value: 3, emoji: "😊", label: "Good" },
    { value: 4, emoji: "😄", label: "Great" },
    { value: 5, emoji: "🔥", label: "Amazing" }
  ];

  const handleSubmit = () => {
    if (selectedMood) {
      onSubmitFeedback({
        mood: selectedMood,
        notes: notes.trim()
      });
      
      // Reset form
      setSelectedMood(null);
      setNotes("");
      onClose();
    }
  };

  const getMoodColor = (mood: number) => {
    if (mood <= 2) return "bg-red-100 border-red-300 text-red-700";
    if (mood === 3) return "bg-yellow-100 border-yellow-300 text-yellow-700";
    return "bg-green-100 border-green-300 text-green-700";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle className="text-xl font-bold">
              Workout Complete! 🎉
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {workoutTitle}
            </p>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Mood Selection */}
          <div className="space-y-3">
            <h3 className="font-medium text-center">How did it feel?</h3>
            <div className="flex justify-center gap-2">
              {moods.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => setSelectedMood(mood.value)}
                  className={`
                    p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105
                    ${selectedMood === mood.value 
                      ? getMoodColor(mood.value) 
                      : "border-gray-200 hover:border-gray-300"
                    }
                  `}
                >
                  <div className="text-2xl mb-1">{mood.emoji}</div>
                  <div className="text-xs font-medium">{mood.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Optional Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              How did you feel? (optional)
            </label>
            <Textarea
              placeholder="e.g., Felt strong on squats, need to work on form for lunges..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-20 text-sm"
            />
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <MessageCircle size={14} />
              Recovery Tips
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Heart size={14} />
              Log Soreness
            </Button>
          </div>

          {/* Submit Button */}
          <div className="space-y-3">
            <Button 
              onClick={handleSubmit}
              className="w-full bg-hashim-600 hover:bg-hashim-700"
              disabled={!selectedMood}
              size="lg"
            >
              Save Feedback
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full"
              onClick={onClose}
            >
              Skip for now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
