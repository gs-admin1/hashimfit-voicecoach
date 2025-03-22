
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import supabase from '@/lib/supabase';
import { useUser } from '@/context/UserContext';
import { toast } from '@/hooks/use-toast';

interface AuthContextProps {
  isAuthenticated: boolean;
  userId: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, setUser } = useUser();
  
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const isAuthed = !!session;
        setIsAuthenticated(isAuthed);
        setUserId(session?.user.id || null);
        setIsLoading(false);
        
        // Sync user profile with UserContext when authenticated
        if (isAuthed && session?.user.id) {
          fetchUserProfile(session.user.id);
        }
      }
    );

    // Check initial session
    checkUser();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  async function checkUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setUserId(session?.user.id || null);
      
      if (session?.user.id) {
        fetchUserProfile(session.user.id);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking auth user:', error);
      setIsLoading(false);
    }
  }
  
  async function fetchUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      
      if (data) {
        // Map Supabase profile to UserContext format
        setUser({
          name: data.name || '',
          age: data.age || 30,
          gender: data.gender || 'male',
          height: data.height || 175,
          weight: data.weight || 75,
          fitnessGoal: data.fitness_goal || 'muscle_gain',
          workoutFrequency: data.workout_frequency || 3,
          diet: data.diet || 'standard',
          equipment: data.equipment || 'full_gym',
          targetWeight: data.target_weight,
          sportsPlayed: data.sports_played,
          hasCompletedAssessment: data.has_completed_assessment || false
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }
  
  async function signIn(email: string, password: string) {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in."
      });
    } catch (error: any) {
      toast({
        title: "Authentication failed",
        description: error.message,
        variant: "destructive"
      });
      console.error('Error signing in:', error);
    } finally {
      setIsLoading(false);
    }
  }
  
  async function signUp(email: string, password: string) {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signUp({ email, password });
      
      if (error) throw error;
      
      toast({
        title: "Account created",
        description: "Your account has been created successfully. Please check your email for verification."
      });
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive"
      });
      console.error('Error signing up:', error);
    } finally {
      setIsLoading(false);
    }
  }
  
  async function signOut() {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      toast({
        title: "Signed out",
        description: "You've been successfully signed out."
      });
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive"
      });
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userId, 
      signIn, 
      signUp, 
      signOut,
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
