
import { useState } from "react";
import { useUser, FitnessGoal, WorkoutFrequency, Diet, Equipment } from "@/context/UserContext";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AnimatedCard } from "./ui-components";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dumbbell, 
  Weight, 
  Calendar,
  Apple,
  User,
  ChevronRight,
  CheckCircle,
  Activity
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function AssessmentForm({ onComplete }: { onComplete: () => void }) {
  const { completeAssessment } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    age: 30,
    gender: "male" as "male" | "female" | "other",
    height: 175,
    weightKg: 75,
    weightLbs: 165,
    heightCm: 175,
    heightFt: 5,
    heightIn: 9,
    useMetric: true,
    fitnessGoal: "muscle_gain" as FitnessGoal,
    workoutFrequency: 3 as WorkoutFrequency,
    diet: "standard" as Diet,
    equipment: "full_gym" as Equipment,
    allergies: [] as string[],
    otherAllergies: ""
  });

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      
      // Update conversions when measurement system changes
      if (field === "useMetric") {
        if (value) {
          // Convert from imperial to metric
          newData.heightCm = Math.round((prev.heightFt * 30.48) + (prev.heightIn * 2.54));
          newData.weightKg = Math.round(prev.weightLbs / 2.205);
        } else {
          // Convert from metric to imperial
          const totalInches = Math.round(prev.heightCm / 2.54);
          newData.heightFt = Math.floor(totalInches / 12);
          newData.heightIn = totalInches % 12;
          newData.weightLbs = Math.round(prev.weightKg * 2.205);
        }
      }
      
      // Update metric values when imperial values change
      if (field === "heightFt" || field === "heightIn") {
        newData.heightCm = Math.round((newData.heightFt * 30.48) + (newData.heightIn * 2.54));
      }
      
      if (field === "weightLbs") {
        newData.weightKg = Math.round(value / 2.205);
      }
      
      // Update imperial values when metric values change
      if (field === "heightCm") {
        const totalInches = Math.round(value / 2.54);
        newData.heightFt = Math.floor(totalInches / 12);
        newData.heightIn = totalInches % 12;
      }
      
      if (field === "weightKg") {
        newData.weightLbs = Math.round(value * 2.205);
      }
      
      return newData;
    });
  };

  const handleSubmit = () => {
    // Use metric values for the API
    const submitData = {
      ...formData,
      height: formData.heightCm,
      weight: formData.weightKg,
      allergies: [...formData.allergies, formData.otherAllergies].filter(Boolean)
    };
    
    completeAssessment(submitData);
    onComplete();
  };

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const toggleAllergy = (allergy: string) => {
    setFormData(prev => {
      const allergies = [...prev.allergies];
      if (allergies.includes(allergy)) {
        return { ...prev, allergies: allergies.filter(a => a !== allergy) };
      } else {
        return { ...prev, allergies: [...allergies, allergy] };
      }
    });
  };

  const renderStepIndicator = () => {
    return (
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3, 4].map((step) => (
          <div 
            key={step} 
            className="flex items-center"
          >
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step < currentStep 
                  ? "bg-hashim-600 text-white" 
                  : step === currentStep 
                    ? "bg-hashim-100 text-hashim-700 border-2 border-hashim-500" 
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {step < currentStep ? (
                <CheckCircle size={16} />
              ) : (
                step
              )}
            </div>
            {step < 4 && (
              <div 
                className={`w-16 h-1 ${
                  step < currentStep ? "bg-hashim-600" : "bg-muted"
                }`}
              ></div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderPersonalInfoStep = () => {
    return (
      <AnimatedCard className="w-full max-w-md">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={(e) => updateFormData("name", e.target.value)}
              className="hashim-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Enter your age"
              value={formData.age.toString()}
              onChange={(e) => updateFormData("age", parseInt(e.target.value) || 0)}
              className="hashim-input"
            />
          </div>

          <div className="space-y-2">
            <Label>Gender</Label>
            <RadioGroup 
              value={formData.gender}
              onValueChange={(value) => updateFormData("gender", value)}
              className="grid grid-cols-3 gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" className="sr-only" />
                <Label
                  htmlFor="male"
                  className={`flex items-center justify-center px-4 py-2 rounded-md border-2 w-full transition-all ${
                    formData.gender === "male" 
                      ? "border-hashim-600 bg-hashim-50 text-hashim-700 font-medium" 
                      : "border-gray-200 hover:border-hashim-300"
                  }`}
                >
                  <User className="mr-2 h-4 w-4" />
                  Male
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" className="sr-only" />
                <Label
                  htmlFor="female"
                  className={`flex items-center justify-center px-4 py-2 rounded-md border-2 w-full transition-all ${
                    formData.gender === "female" 
                      ? "border-hashim-600 bg-hashim-50 text-hashim-700 font-medium" 
                      : "border-gray-200 hover:border-hashim-300"
                  }`}
                >
                  <User className="mr-2 h-4 w-4" />
                  Female
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" className="sr-only" />
                <Label
                  htmlFor="other"
                  className={`flex items-center justify-center px-4 py-2 rounded-md border-2 w-full transition-all ${
                    formData.gender === "other" 
                      ? "border-hashim-600 bg-hashim-50 text-hashim-700 font-medium" 
                      : "border-gray-200 hover:border-hashim-300"
                  }`}
                >
                  <User className="mr-2 h-4 w-4" />
                  Other
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button 
            onClick={nextStep} 
            className="w-full mt-8 bg-hashim-600 hover:bg-hashim-700 text-white"
          >
            Next <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </AnimatedCard>
    );
  };

  const renderBodyInfoStep = () => {
    return (
      <AnimatedCard className="w-full max-w-md">
        <div className="space-y-4">
          <div className="flex items-center justify-end mb-2">
            <Label htmlFor="useMetric" className="text-sm mr-2">Metric</Label>
            <input
              type="checkbox"
              id="useMetric"
              checked={formData.useMetric}
              onChange={(e) => updateFormData("useMetric", e.target.checked)}
              className="toggle-checkbox"
            />
          </div>

          <div className="space-y-2">
            <Label>Height</Label>
            {formData.useMetric ? (
              <div className="relative">
                <Input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Enter height in cm"
                  value={formData.heightCm}
                  onChange={(e) => updateFormData("heightCm", parseInt(e.target.value) || 0)}
                  className="hashim-input pr-10"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">cm</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <Input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Feet"
                    value={formData.heightFt}
                    onChange={(e) => updateFormData("heightFt", parseInt(e.target.value) || 0)}
                    className="hashim-input pr-8"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">ft</span>
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Inches"
                    value={formData.heightIn}
                    onChange={(e) => updateFormData("heightIn", parseInt(e.target.value) || 0)}
                    className="hashim-input pr-8"
                    min="0"
                    max="11"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">in</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Weight</Label>
            {formData.useMetric ? (
              <div className="relative">
                <Input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Enter weight in kg"
                  value={formData.weightKg}
                  onChange={(e) => updateFormData("weightKg", parseInt(e.target.value) || 0)}
                  className="hashim-input pr-10"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">kg</span>
              </div>
            ) : (
              <div className="relative">
                <Input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Enter weight in lbs"
                  value={formData.weightLbs}
                  onChange={(e) => updateFormData("weightLbs", parseInt(e.target.value) || 0)}
                  className="hashim-input pr-10"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">lbs</span>
              </div>
            )}
          </div>

          <div className="flex justify-between mt-8">
            <Button 
              onClick={prevStep} 
              variant="outline" 
              className="border-hashim-300 text-hashim-700 hover:bg-hashim-50"
            >
              Back
            </Button>
            <Button 
              onClick={nextStep} 
              className="bg-hashim-600 hover:bg-hashim-700 text-white"
            >
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </AnimatedCard>
    );
  };

  const renderGoalsStep = () => {
    return (
      <AnimatedCard className="w-full max-w-md">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Fitness Goal</Label>
            <RadioGroup 
              value={formData.fitnessGoal}
              onValueChange={(value) => updateFormData("fitnessGoal", value)}
              className="space-y-2"
            >
              {[
                { id: "muscle_gain", label: "Muscle Gain", icon: Dumbbell },
                { id: "weight_loss", label: "Weight Loss", icon: Weight },
                { id: "endurance", label: "Endurance", icon: Activity },
                { id: "sport_specific", label: "Sport Specific", icon: Activity },
              ].map((goal) => (
                <div key={goal.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={goal.id} id={goal.id} className="sr-only" />
                  <Label
                    htmlFor={goal.id}
                    className={`flex items-center px-4 py-3 rounded-md border-2 w-full transition-all ${
                      formData.fitnessGoal === goal.id 
                        ? "border-hashim-600 bg-hashim-50 text-hashim-700 font-medium" 
                        : "border-gray-200 hover:border-hashim-300"
                    }`}
                  >
                    <goal.icon className="mr-2 h-4 w-4" />
                    {goal.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Workout Frequency (days/week)</Label>
            <RadioGroup 
              value={formData.workoutFrequency.toString()}
              onValueChange={(value) => updateFormData("workoutFrequency", parseInt(value) as WorkoutFrequency)}
              className="grid grid-cols-7 gap-1"
            >
              {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                <div key={num} className="flex items-center">
                  <RadioGroupItem value={num.toString()} id={`freq-${num}`} className="sr-only" />
                  <Label
                    htmlFor={`freq-${num}`}
                    className={`flex items-center justify-center p-2 rounded-md border-2 w-full transition-all ${
                      formData.workoutFrequency === num 
                        ? "border-hashim-600 bg-hashim-50 text-hashim-700 font-medium" 
                        : "border-gray-200 hover:border-hashim-300"
                    }`}
                  >
                    {num}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            <div className="text-xs text-center text-muted-foreground mt-1">
              Days per week
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <Button 
              onClick={prevStep} 
              variant="outline" 
              className="border-hashim-300 text-hashim-700 hover:bg-hashim-50"
            >
              Back
            </Button>
            <Button 
              onClick={nextStep} 
              className="bg-hashim-600 hover:bg-hashim-700 text-white"
            >
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </AnimatedCard>
    );
  };

  const renderFinalStep = () => {
    const allergies = [
      "Dairy", "Eggs", "Peanuts", "Tree nuts", "Soy", 
      "Wheat/Gluten", "Fish", "Shellfish"
    ];
    
    return (
      <AnimatedCard className="w-full max-w-md">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Diet Preference</Label>
            <RadioGroup 
              value={formData.diet}
              onValueChange={(value) => updateFormData("diet", value)}
              className="space-y-2"
            >
              {[
                { id: "standard", label: "Standard"},
                { id: "vegetarian", label: "Vegetarian"},
                { id: "vegan", label: "Vegan"},
                { id: "keto", label: "Keto"},
                { id: "paleo", label: "Paleo"},
                { id: "gluten_free", label: "Gluten Free"},
              ].map((diet) => (
                <div key={diet.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={diet.id} id={diet.id} className="sr-only" />
                  <Label
                    htmlFor={diet.id}
                    className={`flex items-center px-4 py-3 rounded-md border-2 w-full transition-all ${
                      formData.diet === diet.id 
                        ? "border-hashim-600 bg-hashim-50 text-hashim-700 font-medium" 
                        : "border-gray-200 hover:border-hashim-300"
                    }`}
                  >
                    <Apple className="mr-2 h-4 w-4" />
                    {diet.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Allergies & Intolerances</Label>
            <div className="grid grid-cols-2 gap-2">
              {allergies.map((allergy) => (
                <div key={allergy} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`allergy-${allergy}`} 
                    checked={formData.allergies.includes(allergy)}
                    onCheckedChange={() => toggleAllergy(allergy)}
                    className="data-[state=checked]:bg-hashim-600 data-[state=checked]:border-hashim-600"
                  />
                  <Label htmlFor={`allergy-${allergy}`} className="text-sm">
                    {allergy}
                  </Label>
                </div>
              ))}
            </div>
            <div className="mt-2">
              <Label htmlFor="otherAllergies">Other Allergies</Label>
              <Textarea 
                id="otherAllergies"
                placeholder="Enter any other allergies or intolerances"
                value={formData.otherAllergies}
                onChange={(e) => updateFormData("otherAllergies", e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Equipment Available</Label>
            <RadioGroup 
              value={formData.equipment}
              onValueChange={(value) => updateFormData("equipment", value)}
              className="space-y-2"
            >
              {[
                { id: "full_gym", label: "Full Gym Access"},
                { id: "home_gym", label: "Home Gym Setup"},
                { id: "minimal", label: "Minimal Equipment"},
                { id: "bodyweight_only", label: "Bodyweight Only"},
              ].map((equipment) => (
                <div key={equipment.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={equipment.id} id={equipment.id} className="sr-only" />
                  <Label
                    htmlFor={equipment.id}
                    className={`flex items-center px-4 py-3 rounded-md border-2 w-full transition-all ${
                      formData.equipment === equipment.id 
                        ? "border-hashim-600 bg-hashim-50 text-hashim-700 font-medium" 
                        : "border-gray-200 hover:border-hashim-300"
                    }`}
                  >
                    <Dumbbell className="mr-2 h-4 w-4" />
                    {equipment.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex justify-between mt-8">
            <Button 
              onClick={prevStep} 
              variant="outline" 
              className="border-hashim-300 text-hashim-700 hover:bg-hashim-50"
            >
              Back
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="bg-hashim-600 hover:bg-hashim-700 text-white"
            >
              Complete
            </Button>
          </div>
        </div>
      </AnimatedCard>
    );
  };

  return (
    <div className="flex flex-col items-center w-full px-4 py-8">
      {renderStepIndicator()}
      
      {currentStep === 1 && renderPersonalInfoStep()}
      {currentStep === 2 && renderBodyInfoStep()}
      {currentStep === 3 && renderGoalsStep()}
      {currentStep === 4 && renderFinalStep()}
    </div>
  );
}
