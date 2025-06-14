
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompletedItemsListProps {
  items: Array<{
    type: 'workout' | 'meal' | 'habit';
    title: string;
    time: string;
    icon: string;
  }>;
  onViewAll: () => void;
  className?: string;
}

export function CompletedItemsList({ items, onViewAll, className }: CompletedItemsListProps) {
  if (items.length === 0) {
    return (
      <Card className={cn("border-0 shadow-lg bg-gray-50", className)}>
        <CardContent className="p-6 text-center">
          <div className="text-4xl mb-3">🎯</div>
          <h3 className="font-semibold text-gray-600 mb-2">Ready to get started?</h3>
          <p className="text-sm text-gray-500">Complete your first activity today!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-0 shadow-lg bg-white/80 backdrop-blur-sm", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <span className="text-2xl">✅</span>
            <span>Completed Today</span>
          </CardTitle>
          {items.length > 3 && (
            <Button variant="ghost" size="sm" onClick={onViewAll}>
              View All
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.slice(0, 3).map((item, index) => (
          <div
            key={index}
            className="flex items-center space-x-3 p-3 rounded-lg bg-green-50 border border-green-200"
          >
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{item.icon}</span>
                <h4 className="font-semibold text-gray-800">{item.title}</h4>
              </div>
              <p className="text-xs text-gray-500">Completed at {item.time}</p>
            </div>
          </div>
        ))}
        
        {items.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            <p>No activities completed yet today</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
