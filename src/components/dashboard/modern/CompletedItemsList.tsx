
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Dumbbell, UtensilsCrossed } from "lucide-react";

interface CompletedItem {
  type: 'workout' | 'meal' | 'habit';
  name: string;
  time: string;
  completed: boolean;
}

interface CompletedItemsListProps {
  items: CompletedItem[];
}

export function CompletedItemsList({ items }: CompletedItemsListProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'workout':
        return <Dumbbell className="h-4 w-4 text-blue-600" />;
      case 'meal':
        return <UtensilsCrossed className="h-4 w-4 text-emerald-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-white/20 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
          ✅ Completed Today
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {items.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
              Nothing completed yet today. Let's get started! 💪
            </p>
          ) : (
            items.map((item, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="p-1 bg-white dark:bg-gray-700 rounded-full">
                  {getIcon(item.type)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {item.name}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                    {item.time}
                  </p>
                </div>
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
