import { createClient } from "@supabase/supabase-js";

/**
 * Cookie-free, anon-key Supabase client for PUBLIC data (campaigns,
 * fundraisers, public comments). Because it never reads cookies, pages
 * using it can be statically generated and cached on Vercel's CDN (ISR)
 * instead of hitting Supabase on every visit. RLS still applies exactly as
 * for any anonymous visitor.
 *
 * Use createClient() from ./server for anything user-specific.
 */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
