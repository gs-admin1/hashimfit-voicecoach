import { useState } from "react";
import { useUser, FitnessGoal, WorkoutFrequency, Diet, Equipment } from "@/context/UserContext";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AnimatedCard } from "./ui-components";
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

export function AssessmentForm({ onComplete }: { onComplete: () => void }) {
  const { completeAssessment } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    age: 30,
    gender: "male" as "male" | "female" | "other",
    height: 175,
    weight: 75,
    fitnessGoal: "muscle_gain" as FitnessGoal,
    workoutFrequency: 3 as WorkoutFrequency,
    diet: "standard" as Diet,
    equipment: "full_gym" as Equipment,
  });

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    completeAssessment(formData);
    onComplete();
  };

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
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
              className="hashim-radio-group"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" className="sr-only" />
                <Label
                  htmlFor="male"
                  className="hashim-radio-item-blue"
                >
                  <User className="mr-2 h-4 w-4" />
                  Male
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" className="sr-only" />
                <Label
                  htmlFor="female"
                  className="hashim-radio-item-blue"
                >
                  <User className="mr-2 h-4 w-4" />
                  Female
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" className="sr-only" />
                <Label
                  htmlFor="other"
                  className="hashim-radio-item-blue"
                >
                  <User className="mr-2 h-4 w-4" />
                  Other
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button 
            onClick={nextStep} 
            className="hashim-button-primary w-full mt-8"
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
          <div className="space-y-2">
            <Label htmlFor="height">Height (cm)</Label>
            <Input
              id="height"
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Enter your height in cm"
              value={formData.height.toString()}
              onChange={(e) => updateFormData("height", parseInt(e.target.value) || 0)}
              className="hashim-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Enter your weight in kg"
              value={formData.weight.toString()}
              onChange={(e) => updateFormData("weight", parseInt(e.target.value) || 0)}
              className="hashim-input"
            />
          </div>

          <div className="flex justify-between mt-8">
            <Button 
              onClick={prevStep} 
              variant="outline" 
              className="hashim-button-outline"
            >
              Back
            </Button>
            <Button 
              onClick={nextStep} 
              className="hashim-button-primary"
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
              className="hashim-radio-group"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="muscle_gain" id="muscle_gain" className="sr-only" />
                <Label
                  htmlFor="muscle_gain"
                  className="hashim-radio-item-blue"
                >
                  <Dumbbell className="mr-2 h-4 w-4" />
                  Muscle Gain
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weight_loss" id="weight_loss" className="sr-only" />
                <Label
                  htmlFor="weight_loss"
                  className="hashim-radio-item-blue"
                >
                  <Weight className="mr-2 h-4 w-4" />
                  Weight Loss
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="endurance" id="endurance" className="sr-only" />
                <Label
                  htmlFor="endurance"
                  className="hashim-radio-item-blue"
                >
                  <Activity className="mr-2 h-4 w-4" />
                  Endurance
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sport_specific" id="sport_specific" className="sr-only" />
                <Label
                  htmlFor="sport_specific"
                  className="hashim-radio-item-blue"
                >
                  <Activity className="mr-2 h-4 w-4" />
                  Sport Specific
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Workout Frequency (days/week)</Label>
            <RadioGroup 
              value={formData.workoutFrequency.toString()}
              onValueChange={(value) => updateFormData("workoutFrequency", parseInt(value) as WorkoutFrequency)}
              className="hashim-radio-group"
            >
              {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                <div key={num} className="flex items-center space-x-2">
                  <RadioGroupItem value={num.toString()} id={`freq-${num}`} className="sr-only" />
                  <Label
                    htmlFor={`freq-${num}`}
                    className="hashim-radio-item-blue"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {num} {num === 1 ? 'day' : 'days'}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex justify-between mt-8">
            <Button 
              onClick={prevStep} 
              variant="outline" 
              className="hashim-button-outline"
            >
              Back
            </Button>
            <Button 
              onClick={nextStep} 
              className="hashim-button-primary"
            >
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </AnimatedCard>
    );
  };

  const renderFinalStep = () => {
    return (
      <AnimatedCard className="w-full max-w-md">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Diet Preference</Label>
            <RadioGroup 
              value={formData.diet}
              onValueChange={(value) => updateFormData("diet", value)}
              className="hashim-radio-group"
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
                    className="hashim-radio-item-blue"
                  >
                    <Apple className="mr-2 h-4 w-4" />
                    {diet.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Equipment Available</Label>
            <RadioGroup 
              value={formData.equipment}
              onValueChange={(value) => updateFormData("equipment", value)}
              className="hashim-radio-group"
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
                    className="hashim-radio-item-blue"
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
              className="hashim-button-outline"
            >
              Back
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="hashim-button-primary"
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
