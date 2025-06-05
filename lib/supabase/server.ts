import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

export const createClient = () => {
  // These would be environment variables in a real application
  const supabaseUrl = "https://your-project.supabase.co"
  const supabaseKey = "your-anon-key"

  return createSupabaseClient(supabaseUrl, supabaseKey, {
    cookies: {
      get: (name) => {
        return cookies().get(name)?.value
      },
    },
  })
}
