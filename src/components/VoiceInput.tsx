import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, MicOff, Loader2, Check, X, Edit, Volume2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { WorkoutService } from "@/lib/supabase/services/WorkoutService";
import { supabase } from "@/integrations/supabase/client";
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
  const [isComplete, setIsComplete] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [parsedExercise, setParsedExercise] = useState<ParsedExercise | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { userId } = useAuth();

  const startRecording = async () => {
    try {
      console.log("🎤 Starting voice recording...");
      setIsComplete(false);
      setRecordingTime(0);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log("📦 Audio chunk received, size:", event.data.size);
        }
      };
      
      mediaRecorder.onstop = async () => {
        console.log("🛑 Recording stopped, processing audio...");
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        console.log("🔊 Final audio blob size:", audioBlob.size);
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
        
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
      };
      
      mediaRecorder.start();
      setIsListening(true);
      
      // Start recording timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast({
        title: "🎤 Recording...",
        description: "Speak your exercise details now. Tap again to stop.",
      });
      
      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          stopRecording();
        }
      }, 10000);
      
    } catch (error) {
      console.error('❌ Error accessing microphone:', error);
      toast({
        title: "Microphone Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      console.log("⏹️ Stopping recording...");
      mediaRecorderRef.current.stop();
    }
    setIsListening(false);
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      console.log("🔄 Processing audio blob of size:", audioBlob.size);
      
      // Convert blob to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Audio = (reader.result as string).split(',')[1];
          console.log("📝 Converted to base64, length:", base64Audio.length);
          
          console.log("🔑 Calling edge function with proper auth...");
          
          // Use Supabase client to call the edge function - this automatically includes auth
          const { data, error } = await supabase.functions.invoke('voice-workout-parser', {
            body: { audio: base64Audio }
          });
          
          if (error) {
            console.error("❌ Edge function error:", error);
            throw new Error(error.message || 'Failed to process audio');
          }
          
          console.log("✅ Processing result:", data);
          
          if (data.error) {
            throw new Error(data.error);
          }
          
          setTranscript(data.transcript || "");
          setParsedExercise(data.parsed_exercise || null);
          setIsComplete(true);
          setShowConfirmation(true);
          
          toast({
            title: "✅ Audio Processed!",
            description: `Detected: ${data.parsed_exercise?.exercise || "Unknown exercise"}`,
          });
          
        } catch (error) {
          console.error('❌ Error in reader.onloadend:', error);
          throw error;
        }
      };
      
      reader.onerror = () => {
        console.error('❌ FileReader error');
        throw new Error('Failed to read audio file');
      };
      
      reader.readAsDataURL(audioBlob);
      
    } catch (error) {
      console.error('❌ Error processing audio:', error);
      toast({
        title: "Processing Error",
        description: error.message || "Could not process your voice input. Please try again.",
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
      console.log("💾 Confirming exercise:", parsedExercise);
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

      console.log("📋 Exercise log data:", exerciseLogData);

      if (workoutLogId) {
        // Add to existing workout log
        console.log("➕ Adding to existing workout log:", workoutLogId);
        await WorkoutService.addExerciseLogs(workoutLogId, [exerciseLogData]);
      } else if (workoutSchedule) {
        // Create new workout log and associate with schedule
        console.log("🆕 Creating new workout log for schedule:", workoutSchedule.id);
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
        console.log("🏋️ Creating standalone workout log");
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
      setIsComplete(false);
      setRecordingTime(0);
      
      // Trigger refresh of workout data
      if (onWorkoutUpdated) {
        onWorkoutUpdated();
      }

    } catch (error) {
      console.error('❌ Error saving exercise:', error);
      toast({
        title: "Save Error",
        description: "Could not save your exercise. Please try again.",
        variant: "destructive"
      });
    }
  };

  const discardExercise = () => {
    console.log("🗑️ Discarding exercise");
    setShowConfirmation(false);
    setTranscript("");
    setParsedExercise(null);
    setIsComplete(false);
    setRecordingTime(0);
  };

  const handleClick = () => {
    if (isListening) {
      stopRecording();
    } else if (!isProcessing && !showConfirmation) {
      startRecording();
    }
  };

  // Show confirmation dialog with results
  if (showConfirmation && parsedExercise) {
    return (
      <Card className={cn("animate-fade-in border-green-200 bg-green-50 dark:bg-green-900/20", className)}>
        <CardContent className="p-4">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center mb-2">
              <Check className="text-green-600 mr-2" size={20} />
              <h3 className="font-semibold text-lg">Confirm Exercise</h3>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-3 border border-green-200">
              <div className="font-medium text-lg text-green-700 dark:text-green-300">
                {parsedExercise.exercise}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {parsedExercise.sets} sets × {parsedExercise.reps} reps
                {parsedExercise.weight_lbs && ` @ ${parsedExercise.weight_lbs} lbs`}
                {parsedExercise.duration_min && ` for ${parsedExercise.duration_min} minutes`}
              </div>
            </div>
            
            {transcript && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-2 mb-3">
                <div className="text-xs text-gray-500 mb-1 flex items-center justify-center">
                  <Volume2 size={12} className="mr-1" />
                  Transcript
                </div>
                <div className="text-sm italic">"{transcript}"</div>
              </div>
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

  // Show processing state
  if (isProcessing) {
    return (
      <div className={className}>
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Loader2 size={20} className="mr-2 animate-spin text-blue-600" />
              <span className="font-medium">Processing Audio...</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Converting speech to exercise data
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show recording state
  if (isListening) {
    return (
      <div className={className}>
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 animate-pulse">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></div>
              <span className="font-medium text-red-700 dark:text-red-300">Recording...</span>
              <span className="ml-2 text-sm">({recordingTime}s)</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Speak your exercise details clearly
            </div>
            <Button
              onClick={stopRecording}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <MicOff size={16} className="mr-1" />
              Stop Recording
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default state - ready to record
  return (
    <div className={className}>
      <Button
        onClick={handleClick}
        disabled={isProcessing}
        className={cn(
          "relative overflow-hidden transition-all duration-200",
          buttonClassName || "w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-4 shadow-lg"
        )}
      >
        {buttonContent || (
          <>
            <Mic size={20} className="mr-2" />
            Log Exercise
          </>
        )}
      </Button>
    </div>
  );
}
