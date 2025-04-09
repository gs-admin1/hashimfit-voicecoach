
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AssessmentForm } from "@/components/AssessmentForm";
import { Logo } from "@/components/Logo";
import { AnimatedCard } from "@/components/ui-components";
import { Dumbbell } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Assessment() {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleComplete = () => {
    try {
      setIsProcessing(true);
      console.log("Assessment completed, showing success message");
      setShowSuccess(true);
      
      // Add a delay to show the success message before navigating
      setTimeout(() => {
        console.log("Navigating to dashboard");
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Error handling assessment completion:", error);
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
          <p className="text-muted-foreground">
            Your personalized fitness plan is ready. Redirecting to dashboard...
          </p>
        </AnimatedCard>
      ) : (
        <div className="w-full max-w-xl animate-slide-in">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Fitness Assessment</h1>
            <p className="text-muted-foreground">
              Let's get to know you better to create your personalized fitness plan
            </p>
          </div>
          <AssessmentForm onComplete={handleComplete} isProcessing={isProcessing} />
        </div>
      )}
    </div>
  );
}
