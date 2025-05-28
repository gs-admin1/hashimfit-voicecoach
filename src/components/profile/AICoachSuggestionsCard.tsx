
import { AnimatedCard } from "@/components/ui-components";
import { Button } from "@/components/ui/button";
import { Bot, CheckCircle, X } from "lucide-react";

export function AICoachSuggestionsCard() {
  const suggestions = [
    {
      id: 1,
      message: "You've been skipping Sunday workouts — want to remove that day?",
      type: "schedule"
    },
    {
      id: 2, 
      message: "Protein intake is low — update your nutrition goal?",
      type: "nutrition"
    }
  ];

  const handleAcceptSuggestion = (id: number) => {
    console.log(`Accepted suggestion ${id}`);
  };

  const handleDismissSuggestion = (id: number) => {
    console.log(`Dismissed suggestion ${id}`);
  };

  if (suggestions.length === 0) return null;

  return (
    <AnimatedCard className="mb-6" delay={150}>
      <div className="flex items-center mb-4">
        <Bot size={18} className="mr-2 text-hashim-600" />
        <h3 className="font-semibold">Coach Suggestions</h3>
      </div>
      
      <div className="space-y-3">
        {suggestions.map((suggestion) => (
          <div 
            key={suggestion.id}
            className="bg-hashim-50 dark:bg-hashim-900/20 rounded-lg p-3"
          >
            <p className="text-sm text-hashim-700 dark:text-hashim-300 mb-3">
              {suggestion.message}
            </p>
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleAcceptSuggestion(suggestion.id)}
                className="text-xs"
              >
                <CheckCircle size={12} className="mr-1" />
                Accept
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => handleDismissSuggestion(suggestion.id)}
                className="text-xs"
              >
                <X size={12} className="mr-1" />
                Dismiss
              </Button>
            </div>
          </div>
        ))}
      </div>
    </AnimatedCard>
  );
}
