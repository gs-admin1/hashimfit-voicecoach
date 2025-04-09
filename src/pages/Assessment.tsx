
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AssessmentForm } from "@/components/AssessmentForm";
import { Logo } from "@/components/Logo";
import { AnimatedCard } from "@/components/ui-components";
import { Dumbbell, MessageSquare, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

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
      }, 2000);
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-hashim-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="text-center mb-8 animate-fade-in">
        <Logo size="lg" />
        <p className="text-muted-foreground mt-2">
          Your Personal AI Fitness Trainer
        </p>
      </div>
      
      {showSuccess ? (
        <AnimatedCard className="text-center py-8 px-6 max-w-md flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4 animate-scale-in">
            <Dumbbell className="text-green-600" size={24} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Assessment Complete!</h2>
          <p className="text-muted-foreground mb-4">
            Your personalized fitness plan is ready. Redirecting to dashboard...
          </p>
          <div className="flex items-center text-sm bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg mt-2">
            <MessageSquare className="text-blue-500 mr-2" size={16} />
            <p>You can now chat with your AI fitness assistant about your plan!</p>
          </div>
        </AnimatedCard>
      ) : (
        <div className="w-full max-w-xl animate-slide-in">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Fitness Assessment</h1>
            <p className="text-muted-foreground">
              Let's get to know you better to create your personalized fitness plan
            </p>
          </div>
          
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center">
                <AlertCircle className="text-red-500 mr-2" size={18} />
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            </div>
          )}
          
          <AssessmentForm onComplete={handleComplete} isProcessing={isProcessing} />
        </div>
      )}
    </div>
  );
}
