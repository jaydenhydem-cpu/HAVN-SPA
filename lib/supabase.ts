import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client — full DB access, bypasses row-level security.
 * Import only from API routes (never from a client component); the
 * "server-only" guard above throws a build error if that happens.
 *
 * Placeholder fallbacks keep module import from throwing when env vars are
 * absent (e.g. a preview build without secrets). Callers must gate on the env
 * actually being set before issuing queries — lib/booking/db.ts does this and
 * falls back to its in-memory dev store, so the placeholder client is never
 * queried. When the real keys are present, they are always used.
 */
export const isSupabaseConfigured = Boolean(
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL ?? "https://placeholder.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "placeholder-key",
  { auth: { persistSession: false } }
);
