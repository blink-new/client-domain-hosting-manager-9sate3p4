import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oepycqnwjzmikzwmxxyy.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lcHljcW53anptaWt6d214eHl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MDIyODgsImV4cCI6MjA2ODI3ODI4OH0.S4_Ugl7QvX9e86VfohMIVwSqKl_bFhKVfje6ilEms3I'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)