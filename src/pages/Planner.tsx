
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { NavigationBar, AnimatedCard, SectionTitle } from "@/components/ui-components";
import { Button } from "@/components/ui/button";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function PlannerPage() {
  const [date, setDate] = useState<Date>(new Date());
  
  // Mock events for the selected date
  const getEventsForDate = (date: Date) => {
    const day = date.getDay();
    
    // Return different events based on the day of the week
    switch (day) {
      case 1: // Monday
        return [
          { time: "07:00 AM", title: "Morning Cardio", type: "workout" },
          { time: "06:00 PM", title: "Upper Body Strength", type: "workout" }
        ];
      case 3: // Wednesday
        return [
          { time: "07:30 AM", title: "HIIT Session", type: "workout" },
          { time: "08:00 PM", title: "Meal Prep", type: "nutrition" }
        ];
      case 5: // Friday
        return [
          { time: "06:30 AM", title: "Stretching & Mobility", type: "recovery" },
          { time: "05:30 PM", title: "Lower Body Strength", type: "workout" }
        ];
      default:
        return [];
    }
  };
  
  const events = getEventsForDate(date);

  return (
    <div className="min-h-screen bg-gradient-to-b from-hashim-50/50 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-border sticky top-0 z-10 animate-fade-in">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <Logo />
        </div>
      </header>
      
      <main className="pt-4 px-4 animate-fade-in pb-20">
        <div className="max-w-lg mx-auto">
          <SectionTitle 
            title="Planner" 
            subtitle="Schedule your workouts and meals" 
            action={
              <Button size="sm" className="flex items-center">
                <Plus size={16} className="mr-1" />
                New Event
              </Button>
            }
          />
          
          <AnimatedCard className="mb-6">
            <div className="flex justify-center">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </AnimatedCard>
          
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">
              Schedule for {format(date, "EEEE, MMMM d")}
            </h3>
            
            {events.length > 0 ? (
              <div className="space-y-3">
                {events.map((event, index) => (
                  <AnimatedCard key={index} delay={index * 100} className="flex items-center">
                    <div className="w-24 text-sm text-muted-foreground">
                      {event.time}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-muted-foreground capitalize">
                        {event.type}
                      </p>
                    </div>
                    <div className={cn(
                      "w-3 h-10 rounded-r-md",
                      event.type === "workout" ? "bg-hashim-600" :
                      event.type === "nutrition" ? "bg-green-500" :
                      "bg-blue-500"
                    )} />
                  </AnimatedCard>
                ))}
              </div>
            ) : (
              <AnimatedCard className="text-center py-8">
                <p className="text-muted-foreground">No events scheduled for this day</p>
                <Button size="sm" className="mt-4">
                  <Plus size={16} className="mr-1" />
                  Add Event
                </Button>
              </AnimatedCard>
            )}
          </div>
        </div>
      </main>
      
      <NavigationBar />
    </div>
  );
}
