import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://rvurcudryphtlknkjchn.supabase.co";

const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseServiceKey) {
  console.warn(
    "⚠️  SUPABASE_SERVICE_ROLE_KEY is not set. " +
    "Auth token verification will fail — all authenticated requests will return 401. " +
    "Set this env var in your deployment (Vercel, etc.)."
  );
}

export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey || "missing-service-role-key",
  { auth: { persistSession: false, autoRefreshToken: false } },
);
