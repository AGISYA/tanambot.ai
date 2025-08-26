import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jldvlwegedmenylnsraq.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsZHZsd2VnZWRtZW55bG5zcmFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MzgzMTYsImV4cCI6MjA3MTExNDMxNn0.bmHba7K8BF5swHd-V5FninrdB9sfDt8dwTxHGY3Eqhs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})