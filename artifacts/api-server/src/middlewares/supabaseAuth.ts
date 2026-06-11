import type { RequestHandler } from "express";
import { supabaseAdmin } from "../lib/supabase";

export const supabaseAuth: RequestHandler = async (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return next();

  const token = authHeader.slice(7);

  try {
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (!error && user) {
      req.userId = user.id;
      req.userEmail = user.email ?? "";
      req.userName =
        (user.user_metadata?.full_name as string | undefined) ??
        user.email?.split("@")[0] ??
        "Student";
    }
  } catch {
    // Invalid token — continue unauthenticated
  }

  next();
};
