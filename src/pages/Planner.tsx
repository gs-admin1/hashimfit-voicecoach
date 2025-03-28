
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { NavigationBar } from "@/components/ui-components";
import { ChatFAB } from "@/components/ChatFAB";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Calendar,
  ChevronLeft, 
  ChevronRight,
  Clock
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel 
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface WorkoutSession {
  id: string;
  date: Date;
  title: string;
  duration: number;
  notes?: string;
  type: "strength" | "cardio" | "flexibility" | "recovery";
}

export default function PlannerPage() {
  const [showLogDialog, setShowLogDialog] = useState(false);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const { toast } = useToast();
  
  const workoutTypes = [
    { value: "strength", label: "Strength Training" },
    { value: "cardio", label: "Cardio" },
    { value: "flexibility", label: "Flexibility & Mobility" },
    { value: "recovery", label: "Recovery" },
  ];

  const form = useForm({
    defaultValues: {
      title: "",
      date: new Date().toISOString().split("T")[0],
      duration: 45,
      notes: "",
      type: "strength" as const,
    },
  });

  const onSubmit = (data: any) => {
    const newSession: WorkoutSession = {
      id: Date.now().toString(),
      date: new Date(data.date),
      title: data.title,
      duration: data.duration,
      notes: data.notes,
      type: data.type,
    };
    
    setSessions([...sessions, newSession]);
    setShowLogDialog(false);
    form.reset();
    
    toast({
      title: "Workout session logged",
      description: "Your workout has been successfully recorded.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-hashim-50/50 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-border sticky top-0 z-10 animate-fade-in">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <Logo />
          <Button 
            className="bg-hashim-600 hover:bg-hashim-700 text-white"
            onClick={() => setShowLogDialog(true)}
          >
            <Plus size={16} className="mr-2" />
            Log Workout Session
          </Button>
        </div>
      </header>
      
      <main className="pt-4 px-4 animate-fade-in pb-20">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold mb-6">Workout Planner</h1>
          
          <div className="flex justify-between items-center mb-6">
            <Button variant="outline" size="sm">
              <ChevronLeft size={16} className="mr-1" />
              Previous
            </Button>
            <div className="font-medium">
              <Calendar size={16} className="inline mr-2" />
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
            <Button variant="outline" size="sm">
              Next
              <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>
          
          {sessions.length > 0 ? (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div 
                  key={session.id} 
                  className="bg-white dark:bg-gray-800 rounded-lg border p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{session.title}</h3>
                      <p className="text-sm text-muted-foreground flex items-center mt-1">
                        <Calendar size={14} className="mr-1" />
                        {session.date.toLocaleDateString()}
                        <span className="mx-2">•</span>
                        <Clock size={14} className="mr-1" />
                        {session.duration} min
                      </p>
                    </div>
                    <div className="bg-hashim-50 text-hashim-700 text-xs font-medium px-2.5 py-0.5 rounded">
                      {workoutTypes.find(t => t.value === session.type)?.label}
                    </div>
                  </div>
                  {session.notes && (
                    <p className="text-sm mt-3 text-muted-foreground">{session.notes}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border border-dashed rounded-lg">
              <p className="text-muted-foreground">
                No workout sessions logged yet.
              </p>
              <Button 
                className="mt-4 bg-hashim-600 hover:bg-hashim-700 text-white"
                onClick={() => setShowLogDialog(true)}
              >
                <Plus size={16} className="mr-2" />
                Add Your First Session
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Log Workout Session</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workout Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Upper Body Strength" required {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" required {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (mins)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={5} 
                          max={300} 
                          required
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workout Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select workout type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {workoutTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="How was your workout? Any personal records?"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowLogDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-hashim-600 hover:bg-hashim-700 text-white">
                  Save Workout
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <NavigationBar />
      <ChatFAB />
    </div>
  );
}
