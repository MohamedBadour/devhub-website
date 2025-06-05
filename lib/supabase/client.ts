import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Create a single supabase client for the entire client-side application
let client = null

export const createClient = () => {
  if (client) return client

  // These would be environment variables in a real application
  const supabaseUrl = "https://your-project.supabase.co"
  const supabaseKey = "your-anon-key"

  client = createSupabaseClient(supabaseUrl, supabaseKey)
  return client
}
