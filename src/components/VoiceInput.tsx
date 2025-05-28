
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, MicOff, Loader2, Check, X, Edit } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { WorkoutService } from "@/lib/supabase/services/WorkoutService";
import { cn } from "@/lib/utils";

interface VoiceInputProps {
  selectedWorkout?: any;
  onWorkoutUpdated?: () => void;
  className?: string;
  buttonClassName?: string;
  buttonContent?: React.ReactNode;
}

interface ParsedExercise {
  sets?: number;
  reps?: string;
  exercise?: string;
  weight_lbs?: number;
  duration_min?: number;
}

export function VoiceInput({ 
  selectedWorkout, 
  onWorkoutUpdated, 
  className,
  buttonClassName,
  buttonContent 
}: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [parsedExercise, setParsedExercise] = useState<ParsedExercise | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { userId } = useAuth();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsListening(true);
      
      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          stopRecording();
        }
      }, 10000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsListening(false);
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        // Send to our edge function for transcription and parsing
        const response = await fetch('/api/voice-workout-parser', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            audio: base64Audio
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to process audio');
        }
        
        const result = await response.json();
        
        if (result.error) {
          throw new Error(result.error);
        }
        
        setTranscript(result.transcript || "");
        setParsedExercise(result.parsed_exercise || null);
        setShowConfirmation(true);
        
      };
      reader.readAsDataURL(audioBlob);
      
    } catch (error) {
      console.error('Error processing audio:', error);
      toast({
        title: "Processing Error",
        description: "Could not process your voice input. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmExercise = async () => {
    if (!parsedExercise || !userId) {
      toast({
        title: "Error",
        description: "Missing exercise data or user authentication.",
        variant: "destructive"
      });
      return;
    }

    try {
      const today = new Date();
      const dateString = today.toISOString().split('T')[0];
      
      // Check if there's a scheduled workout for today
      let workoutSchedule = null;
      let workoutLogId = null;
      
      if (selectedWorkout && selectedWorkout.schedule_id) {
        workoutSchedule = selectedWorkout;
        workoutLogId = selectedWorkout.workout_log_id;
      } else {
        // Get today's scheduled workouts
        const schedules = await WorkoutService.getWorkoutSchedule(userId, dateString, dateString);
        if (schedules.length > 0) {
          workoutSchedule = schedules[0];
          workoutLogId = schedules[0].workout_log_id;
        }
      }
      
      // Create exercise log entry
      const exerciseLogData = {
        exercise_name: parsedExercise.exercise || "Unknown Exercise",
        sets_completed: parsedExercise.sets || 1,
        reps_completed: parsedExercise.reps || "1",
        weight_used: parsedExercise.weight_lbs ? `${parsedExercise.weight_lbs} lbs` : (parsedExercise.duration_min ? `${parsedExercise.duration_min} min` : 'bodyweight'),
        order_index: 0
      };

      if (workoutLogId) {
        // Add to existing workout log
        await WorkoutService.addExerciseLogs(workoutLogId, [exerciseLogData]);
      } else if (workoutSchedule) {
        // Create new workout log and associate with schedule
        const workoutLog = {
          user_id: userId,
          workout_plan_id: workoutSchedule.workout_plan_id,
          start_time: new Date().toISOString(),
          end_time: new Date().toISOString(),
        };
        
        const newLogId = await WorkoutService.logWorkout(workoutLog, [exerciseLogData]);
        
        if (newLogId && workoutSchedule.id) {
          await WorkoutService.completeScheduledWorkout(workoutSchedule.id, newLogId);
        }
      } else {
        // Create a standalone workout log for today
        const workoutLog = {
          user_id: userId,
          start_time: new Date().toISOString(),
          end_time: new Date().toISOString(),
        };
        
        await WorkoutService.logWorkout(workoutLog, [exerciseLogData]);
      }

      toast({
        title: "Exercise Logged! 💪",
        description: `${parsedExercise.exercise} has been added to your workout.`,
      });

      // Reset state
      setShowConfirmation(false);
      setTranscript("");
      setParsedExercise(null);
      
      // Trigger refresh of workout data
      if (onWorkoutUpdated) {
        onWorkoutUpdated();
      }

    } catch (error) {
      console.error('Error saving exercise:', error);
      toast({
        title: "Save Error",
        description: "Could not save your exercise. Please try again.",
        variant: "destructive"
      });
    }
  };

  const discardExercise = () => {
    setShowConfirmation(false);
    setTranscript("");
    setParsedExercise(null);
  };

  const handleClick = () => {
    if (isListening) {
      stopRecording();
    } else if (!isProcessing) {
      startRecording();
    }
  };

  if (showConfirmation && parsedExercise) {
    return (
      <Card className={cn("animate-fade-in", className)}>
        <CardContent className="p-4">
          <div className="text-center mb-4">
            <h3 className="font-semibold text-lg mb-2">Confirm Exercise</h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-3">
              <div className="font-medium text-lg">{parsedExercise.exercise}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {parsedExercise.sets} sets × {parsedExercise.reps} reps
                {parsedExercise.weight_lbs && ` @ ${parsedExercise.weight_lbs} lbs`}
                {parsedExercise.duration_min && ` for ${parsedExercise.duration_min} minutes`}
              </div>
            </div>
            {transcript && (
              <div className="text-xs text-gray-500 italic">"{transcript}"</div>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button 
              onClick={confirmExercise}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <Check size={16} className="mr-1" />
              Save
            </Button>
            <Button 
              onClick={() => {}}
              variant="outline"
              className="flex-1"
            >
              <Edit size={16} className="mr-1" />
              Edit
            </Button>
            <Button 
              onClick={discardExercise}
              variant="outline"
              className="flex-1"
            >
              <X size={16} className="mr-1" />
              Discard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Button
        onClick={handleClick}
        disabled={isProcessing}
        className={cn(
          "relative overflow-hidden transition-all duration-200",
          isListening && "animate-pulse",
          buttonClassName || "w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-4 shadow-lg"
        )}
      >
        {buttonContent || (
          <>
            {isProcessing ? (
              <Loader2 size={20} className="mr-2 animate-spin" />
            ) : isListening ? (
              <MicOff size={20} className="mr-2" />
            ) : (
              <Mic size={20} className="mr-2" />
            )}
            
            {isProcessing ? "Processing..." : isListening ? "Stop Recording" : "Log Workout"}
          </>
        )}
        
        {isListening && (
          <div className="absolute inset-0 bg-red-400 opacity-20 animate-pulse rounded-xl" />
        )}
      </Button>
    </div>
  );
}
