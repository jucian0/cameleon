import { createBrowserClient } from '@supabase/auth-helpers-remix'

export function createClient(
  url: string,
  key: string
) {
  return createBrowserClient(
    url,
    key
  )
}