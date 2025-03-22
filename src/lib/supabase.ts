
import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = "https://mdtovxilchzvafwhtfrf.supabase.co";
export const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kdG92eGlsY2h6dmFmd2h0ZnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2MjE3MDAsImV4cCI6MjA1ODE5NzcwMH0.W1az61UCTi7V-XYL049kUpmbKNjEH1-OxYnEutpug3U";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
