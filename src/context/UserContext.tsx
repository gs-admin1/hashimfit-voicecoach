
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ProfileService } from "@/lib/supabase/services/ProfileService";

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
  allergies?: string[];
  hasCompletedAssessment: boolean;
}

interface UserContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile) => void;
  updateUser: (updates: Partial<UserProfile>) => Promise<boolean>;
  isAuthenticated: boolean;
  completeAssessment: (profile: Partial<UserProfile>) => Promise<boolean>;
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
  allergies: [],
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserProfile | null>(null);
  const auth = useAuth();
  // Safely destructure auth properties with default values to prevent errors
  const isAuthenticated = auth?.isAuthenticated || false;
  const userId = auth?.userId || null;

  const setUser = (newUser: UserProfile) => {
    setUserState(newUser);
  };

  const updateUser = async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (user && userId) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      
      // Update profile in Supabase
      const profileData = ProfileService.mapUserContextToProfile(updatedUser);
      return await ProfileService.updateProfile(userId, profileData);
    }
    return false;
  };

  const completeAssessment = async (profile: Partial<UserProfile>): Promise<boolean> => {
    if (userId) {
      const newUser = {
        ...defaultUser,
        ...profile,
        hasCompletedAssessment: true,
      };
      setUser(newUser);
      
      // Update profile in Supabase
      const profileData = ProfileService.mapUserContextToProfile(newUser);
      profileData.has_completed_assessment = true;
      return await ProfileService.updateProfile(userId, profileData);
    }
    return false;
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        updateUser,
        isAuthenticated,
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
