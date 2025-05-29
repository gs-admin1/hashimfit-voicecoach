
import { useState, useRef } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { AnimatedCard } from "./ui-components";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import supabase from "@/lib/supabase";

interface VoiceInputProps {
  selectedWorkout?: any;
  onWorkoutUpdated?: () => void;
}

export function VoiceInput({ selectedWorkout, onWorkoutUpdated }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const animationRef = useRef<number>();
  const { userId } = useAuth();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      // Audio level visualization
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      analyser.fftSize = 256;
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const updateAudioLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average / 255);
        
        if (isRecording) {
          animationRef.current = requestAnimationFrame(updateAudioLevel);
        }
      };
      
      updateAudioLevel();
      
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
      
      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        audioContext.close();
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        setAudioLevel(0);
        processAudio();
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording started",
        description: "Speak your workout details...",
      });
      
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Recording Error",
        description: "Could not access your microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async () => {
    if (audioChunksRef.current.length === 0 || !userId) {
      toast({
        title: "Error",
        description: "No audio recorded or user not authenticated.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // Upload audio to Supabase Storage
      const fileName = `${userId}/voice/${Date.now()}.webm`;
      
      toast({
        title: "Processing audio",
        description: "Transcribing and parsing your workout...",
      });
      
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('voice-recordings')
        .upload(fileName, audioBlob);
        
      if (uploadError) {
        throw new Error(`Failed to upload audio: ${uploadError.message}`);
      }
      
      // Get public URL
      const { data: urlData } = supabase
        .storage
        .from('voice-recordings')
        .getPublicUrl(fileName);
        
      const audioUrl = urlData.publicUrl;
      
      // Call edge function to process the audio
      const { data, error } = await supabase.functions.invoke('voice-workout-parser', {
        body: {
          audioUrl,
          userId,
          workoutContext: selectedWorkout ? {
            schedule_id: selectedWorkout.schedule_id,
            workout_plan_id: selectedWorkout.id,
            exercises: selectedWorkout.exercises
          } : null
        },
      });
      
      if (error) {
        throw new Error(`Processing error: ${error.message}`);
      }
      
      if (!data.success) {
        throw new Error(data.error || "Failed to process audio");
      }
      
      // Success
      toast({
        title: "Workout logged!",
        description: `Added: ${data.exercises.map((ex: any) => ex.exercise_name).join(', ')}`,
      });
      
      // Trigger refresh
      if (onWorkoutUpdated) {
        onWorkoutUpdated();
      }
      
      // Clean up audio file
      setTimeout(async () => {
        await supabase.storage.from('voice-recordings').remove([fileName]);
      }, 5000);
      
    } catch (error) {
      console.error("Error processing audio:", error);
      toast({
        title: "Processing failed",
        description: error.message || "Failed to process your workout audio",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <AnimatedCard className="relative overflow-hidden bg-white/80 backdrop-blur-md border border-gray-200/60 shadow-sm">
      <div className="flex flex-col items-center justify-center p-3">
        <div className="mb-3">
          <button
            onClick={toggleRecording}
            disabled={isProcessing}
            className={cn(
              "relative rounded-full p-3 transition-all duration-200 shadow-sm border active:scale-95",
              isRecording 
                ? "bg-gradient-to-b from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 border-red-400/40" 
                : isProcessing
                ? "bg-gradient-to-b from-gray-300 to-gray-400 border-gray-400/40 cursor-not-allowed"
                : "bg-gradient-to-b from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 border-gray-300/40"
            )}
          >
            {isProcessing ? (
              <Volume2 className="text-gray-600 animate-pulse" size={18} />
            ) : isRecording ? (
              <MicOff className="text-white" size={18} />
            ) : (
              <Mic className="text-gray-700" size={18} />
            )}
            
            {/* Audio level indicator */}
            {isRecording && (
              <div 
                className="absolute inset-0 rounded-full border-2 border-red-300 opacity-70 animate-pulse"
                style={{
                  transform: `scale(${1 + audioLevel * 0.3})`,
                  transition: 'transform 0.1s ease-out'
                }}
              />
            )}
          </button>
        </div>
        
        <div className="text-center">
          <h3 className="font-semibold text-sm mb-1 text-gray-900">
            {isProcessing ? "Processing" : isRecording ? "Recording" : "Voice Log"}
          </h3>
          <p className="text-gray-600 text-xs leading-tight">
            {isProcessing 
              ? "Parsing workout..." 
              : isRecording 
                ? "Tap to stop recording" 
                : "Quick exercise logging"}
          </p>
        </div>
      </div>
    </AnimatedCard>
  );
}
