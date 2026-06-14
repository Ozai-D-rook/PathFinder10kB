import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://rvurcudryphtlknkjchn.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2dXJjdWRyeXBodGxrbmtqY2huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5OTcwMjMsImV4cCI6MjA5NjU3MzAyM30.W6ppKj435LKIJIrolstL2m5-qdoIBXuVHIzO1pAaft4";

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
