
import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { AnimatedCard, SectionTitle } from "@/components/ui-components";
import { Logo } from "@/components/Logo";
import { NavigationBar } from "@/components/ui-components";
import { 
  User, 
  Weight, 
  Dumbbell, 
  Calendar, 
  Apple,
  LogOut,
  Edit,
  Save,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorkoutFrequency } from "@/context/UserContext";

export default function ProfilePage() {
  const { user, setUser, updateUser } = useUser();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm({
    defaultValues: {
      name: user?.name || "",
      age: user?.age?.toString() || "",
      gender: user?.gender || "male",
      height: user?.height?.toString() || "",
      weight: user?.weight?.toString() || "",
      fitnessGoal: user?.fitnessGoal || "muscle_gain",
      workoutFrequency: user?.workoutFrequency?.toString() || "3",
      diet: user?.diet || "standard",
      equipment: user?.equipment || "full_gym",
    }
  });

  const handleLogout = () => {
    localStorage.removeItem("hashimfit_user");
    setUser({
      name: "",
      age: 0,
      gender: "male",
      height: 0,
      weight: 0,
      fitnessGoal: "muscle_gain",
      workoutFrequency: 3,
      diet: "standard",
      equipment: "full_gym",
      hasCompletedAssessment: false
    });
    navigate("/");
  };

  const toggleEditMode = () => {
    if (isEditing) {
      // If we're exiting edit mode without saving, reset form values
      form.reset({
        name: user?.name || "",
        age: user?.age?.toString() || "",
        gender: user?.gender || "male",
        height: user?.height?.toString() || "",
        weight: user?.weight?.toString() || "",
        fitnessGoal: user?.fitnessGoal || "muscle_gain",
        workoutFrequency: user?.workoutFrequency?.toString() || "3",
        diet: user?.diet || "standard",
        equipment: user?.equipment || "full_gym",
      });
    }
    setIsEditing(!isEditing);
  };

  const onSubmit = async (data) => {
    try {
      // Convert workout frequency to the proper type (1-7)
      const frequency = parseInt(data.workoutFrequency, 10) as WorkoutFrequency;
      
      // Ensure workout frequency is within valid range
      if (frequency < 1 || frequency > 7) {
        toast({
          title: "Invalid frequency",
          description: "Workout frequency must be between 1 and 7 days",
          variant: "destructive"
        });
        return;
      }
      
      const updateData = {
        name: data.name,
        age: parseInt(data.age, 10),
        gender: data.gender,
        height: parseFloat(data.height),
        weight: parseFloat(data.weight),
        fitnessGoal: data.fitnessGoal,
        workoutFrequency: frequency,
        diet: data.diet,
        equipment: data.equipment,
      };
      
      const success = await updateUser(updateData);
      
      if (success) {
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        });
        setIsEditing(false);
      } else {
        toast({
          title: "Update failed",
          description: "There was a problem updating your profile.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: "There was a problem updating your profile.",
        variant: "destructive"
      });
    }
  };

  // Map fitness goal to readable text
  const fitnessGoalMap = {
    muscle_gain: "Muscle Gain",
    weight_loss: "Weight Loss",
    endurance: "Endurance",
    sport_specific: "Sport Specific Training"
  };

  // Map diet preference to readable text
  const dietMap = {
    standard: "Standard",
    vegetarian: "Vegetarian",
    vegan: "Vegan",
    keto: "Keto",
    paleo: "Paleo",
    gluten_free: "Gluten Free"
  };

  // Map equipment to readable text
  const equipmentMap = {
    full_gym: "Full Gym Access",
    home_gym: "Home Gym Setup",
    minimal: "Minimal Equipment",
    bodyweight_only: "Bodyweight Only"
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-hashim-50/50 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-border sticky top-0 z-10 animate-fade-in">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <Logo />
          <div>
            {isEditing ? (
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={toggleEditMode}
                  className="flex items-center text-destructive"
                >
                  <X size={16} className="mr-1" />
                  Cancel
                </Button>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={form.handleSubmit(onSubmit)}
                  className="flex items-center bg-hashim-600 hover:bg-hashim-700"
                >
                  <Save size={16} className="mr-1" />
                  Save
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                onClick={toggleEditMode}
                className="flex items-center"
              >
                <Edit size={16} className="mr-1" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </header>
      
      <main className="pt-6 px-4 pb-24 animate-fade-in max-w-lg mx-auto">
        <SectionTitle title="Profile" subtitle="Your fitness details" />
        
        {isEditing ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <AnimatedCard>
                <h3 className="font-semibold flex items-center mb-4">
                  <User size={18} className="mr-2 text-hashim-600" />
                  Personal Details
                </h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height (cm)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (kg)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </AnimatedCard>
              
              <AnimatedCard>
                <h3 className="font-semibold flex items-center mb-4">
                  <Dumbbell size={18} className="mr-2 text-hashim-600" />
                  Fitness Preferences
                </h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="fitnessGoal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fitness Goal</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select goal" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                            <SelectItem value="weight_loss">Weight Loss</SelectItem>
                            <SelectItem value="endurance">Endurance</SelectItem>
                            <SelectItem value="sport_specific">Sport Specific Training</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="workoutFrequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Workout Frequency (days/week)</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">1 day</SelectItem>
                            <SelectItem value="2">2 days</SelectItem>
                            <SelectItem value="3">3 days</SelectItem>
                            <SelectItem value="4">4 days</SelectItem>
                            <SelectItem value="5">5 days</SelectItem>
                            <SelectItem value="6">6 days</SelectItem>
                            <SelectItem value="7">7 days</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="equipment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Available Equipment</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select equipment" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="full_gym">Full Gym Access</SelectItem>
                            <SelectItem value="home_gym">Home Gym Setup</SelectItem>
                            <SelectItem value="minimal">Minimal Equipment</SelectItem>
                            <SelectItem value="bodyweight_only">Bodyweight Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              </AnimatedCard>
              
              <AnimatedCard>
                <h3 className="font-semibold flex items-center mb-4">
                  <Apple size={18} className="mr-2 text-hashim-600" />
                  Diet Preferences
                </h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="diet"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Diet Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select diet" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="vegetarian">Vegetarian</SelectItem>
                            <SelectItem value="vegan">Vegan</SelectItem>
                            <SelectItem value="keto">Keto</SelectItem>
                            <SelectItem value="paleo">Paleo</SelectItem>
                            <SelectItem value="gluten_free">Gluten Free</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              </AnimatedCard>
            </form>
          </Form>
        ) : (
          <>
            <div className="mb-8 text-center">
              <div className="w-24 h-24 rounded-full bg-hashim-100 dark:bg-hashim-900/20 mx-auto flex items-center justify-center mb-4">
                <User size={40} className="text-hashim-600" />
              </div>
              <h2 className="text-2xl font-bold">{user?.name}</h2>
              <p className="text-muted-foreground">
                {user?.age} years • {user?.gender === "male" ? "Male" : user?.gender === "female" ? "Female" : "Other"}
              </p>
            </div>
            
            <AnimatedCard className="mb-6">
              <h3 className="font-semibold flex items-center mb-4">
                <User size={18} className="mr-2 text-hashim-600" />
                Personal Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <p className="text-muted-foreground">Height</p>
                  <p className="font-medium">{user?.height}cm</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-muted-foreground">Weight</p>
                  <p className="font-medium">{user?.weight}kg</p>
                </div>
              </div>
            </AnimatedCard>
            
            <AnimatedCard className="mb-6" delay={100}>
              <h3 className="font-semibold flex items-center mb-4">
                <Dumbbell size={18} className="mr-2 text-hashim-600" />
                Fitness Preferences
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <p className="text-muted-foreground">Goal</p>
                  <p className="font-medium">
                    {user?.fitnessGoal ? fitnessGoalMap[user.fitnessGoal] : ""}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-muted-foreground">Workout Frequency</p>
                  <p className="font-medium">
                    {user?.workoutFrequency} days / week
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-muted-foreground">Equipment</p>
                  <p className="font-medium">
                    {user?.equipment ? equipmentMap[user.equipment] : ""}
                  </p>
                </div>
              </div>
            </AnimatedCard>
            
            <AnimatedCard className="mb-8" delay={200}>
              <h3 className="font-semibold flex items-center mb-4">
                <Apple size={18} className="mr-2 text-hashim-600" />
                Diet Preferences
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <p className="text-muted-foreground">Diet Type</p>
                  <p className="font-medium">
                    {user?.diet ? dietMap[user.diet] : ""}
                  </p>
                </div>
              </div>
            </AnimatedCard>
            
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                className="hashim-button-outline flex items-center"
                onClick={handleLogout}
              >
                <LogOut size={16} className="mr-2" />
                Log Out
              </Button>
            </div>
          </>
        )}
      </main>
      
      <NavigationBar />
    </div>
  );
}
