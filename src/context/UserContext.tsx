
import { createContext, useContext, useState, ReactNode } from "react";

export type FitnessGoal = "muscle_gain" | "weight_loss" | "endurance" | "sport_specific";
export type WorkoutFrequency = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type Diet = "standard" | "vegetarian" | "vegan" | "keto" | "paleo" | "gluten_free";
export type Equipment = "full_gym" | "home_gym" | "minimal" | "bodyweight_only";

export interface UserProfile {
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  height: number; // in cm
  weight: number; // in kg
  fitnessGoal: FitnessGoal;
  workoutFrequency: WorkoutFrequency;
  targetWeight?: number; // optional target weight in kg
  diet: Diet;
  equipment: Equipment;
  sportsPlayed?: string[];
  hasCompletedAssessment: boolean;
}

interface UserContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  isAuthenticated: boolean;
  completeAssessment: (profile: Partial<UserProfile>) => void;
}

const defaultUser: UserProfile = {
  name: "",
  age: 30,
  gender: "male",
  height: 175,
  weight: 75,
  fitnessGoal: "muscle_gain",
  workoutFrequency: 3,
  diet: "standard",
  equipment: "full_gym",
  hasCompletedAssessment: false,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserProfile | null>(null);

  const setUser = (newUser: UserProfile) => {
    setUserState(newUser);
    // In a real app, we would save to localStorage or a database
    localStorage.setItem("hashimfit_user", JSON.stringify(newUser));
  };

  const updateUser = (updates: Partial<UserProfile>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
    }
  };

  const completeAssessment = (profile: Partial<UserProfile>) => {
    const newUser = {
      ...defaultUser,
      ...profile,
      hasCompletedAssessment: true,
    };
    setUser(newUser);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        updateUser,
        isAuthenticated: !!user,
        completeAssessment,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
