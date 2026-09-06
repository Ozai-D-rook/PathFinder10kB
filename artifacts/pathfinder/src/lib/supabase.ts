import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string) ||
  "https://djkvmizbroguxbeikxvb.supabase.co";

const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqa3ZtaXpicm9ndXhiZWlreHZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMDk2MTEsImV4cCI6MjA5Nzc4NTYxMX0.9nuY0OYm1BTwrb-aQ7LFJMFijvhsdlMKEkTEPEYssBE";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
