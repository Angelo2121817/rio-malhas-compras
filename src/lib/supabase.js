import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const supabaseConfigurado = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'))

export const supabase = supabaseConfigurado
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export const temSupabase = () => !!supabase
