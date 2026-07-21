import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client — full DB access, bypasses row-level security.
 * Import only from API routes (never from a client component); the
 * "server-only" guard above throws a build error if that happens.
 */
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);
