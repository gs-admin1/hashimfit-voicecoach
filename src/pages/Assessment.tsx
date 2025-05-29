
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RedesignedAssessmentForm } from "@/components/RedesignedAssessmentForm";
import { Logo } from "@/components/Logo";
import { AnimatedCard } from "@/components/ui-components";
import { Dumbbell, MessageSquare, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

export default function Assessment() {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [showSuccess, setShowSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleComplete = async () => {
    try {
      if (!userId) {
        toast({
          title: "Not logged in",
          description: "You must be logged in to complete the assessment",
          variant: "destructive",
        });
        return;
      }
      
      setIsProcessing(true);
      setError(null);
      console.log("Assessment completed, showing success message");
      setShowSuccess(true);
      
      // Add a delay to show the success message before navigating
      setTimeout(() => {
        console.log("Navigating to dashboard");
        navigate("/dashboard");
      }, 3000);
    } catch (error) {
      console.error("Error handling assessment completion:", error);
      setError("There was an error processing your assessment. Please try again.");
      toast({
        title: "Error",
        description: "There was an error processing your assessment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-hashim-50 to-white dark:from-gray-900 dark:to-gray-800">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <AnimatedCard className="text-center py-8 px-6 flex flex-col items-center">
            <motion.div 
              className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <Dumbbell className="text-green-600" size={32} />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold mb-3">🎉 Assessment Complete!</h2>
              <p className="text-muted-foreground mb-6">
                Your personalized fitness plan is being crafted by our AI trainer...
              </p>
              
              <div className="flex items-center justify-center mb-6">
                <Loader2 className="animate-spin text-hashim-500 mr-2" size={20} />
                <span className="text-sm text-hashim-600">Building your custom plan</span>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex items-center text-sm bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <MessageSquare className="text-blue-500 mr-2 flex-shrink-0" size={16} />
              <p className="text-left">
                <strong>What's next?</strong><br />
                You'll get a personalized workout schedule, nutrition plan, and can chat with your AI fitness assistant!
              </p>
            </motion.div>
          </AnimatedCard>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-hashim-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="text-center pt-8 pb-4 px-4">
        <Logo size="lg" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-2xl font-bold mt-4 mb-2">Welcome to HashimFit!</h1>
          <p className="text-muted-foreground">
            Let's create your personalized fitness journey
          </p>
        </motion.div>
      </div>
      
      {error && (
        <motion.div 
          className="mx-4 mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center">
              <AlertCircle className="text-red-500 mr-2" size={18} />
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        </motion.div>
      )}
      
      <RedesignedAssessmentForm onComplete={handleComplete} isProcessing={isProcessing} />
    </div>
  );
}
