import { createBrowserClient } from "@supabase/ssr"

export { createBrowserClient }

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  // If environment variables are not set, the client will fail gracefully when used
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
