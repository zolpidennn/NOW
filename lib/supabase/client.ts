import { createBrowserClient } from "@supabase/ssr"

export { createBrowserClient }

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tvgpbocjlofvafdrrpzz.supabase.co"
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2Z3Bib2NqbG9mdmFmZHJycHp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxNDExNTQsImV4cCI6MjA4MTcxNzE1NH0.tnON3r5HJyl2Rr02psFdBmK0XRr7BykOwhLgDMhCgNc"

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
