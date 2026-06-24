import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://your-supabase-url.supabase.co'
const SUPABASE_KEY = 'your-supabase-key'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
