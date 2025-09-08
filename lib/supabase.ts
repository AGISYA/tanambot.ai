import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing')
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-js-web'
      }
    }
  }
)

export type Database = {
  public: {
    Tables: {
      chatbot: {
        Row: {
          id: string
          user_id: string | null
          name: string | null
          is_active: boolean
          status: string | null
          plan_id: string
          is_auto_renewal: boolean | null
          ai_usages: number | null
          ai_quota: number | null
          prompt: string | null
          created_at: string
          updated_at: string | null
          expired_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          name?: string | null
          is_active?: boolean
          status?: string | null
          plan_id: string
          is_auto_renewal?: boolean | null
          ai_usages?: number | null
          ai_quota?: number | null
          prompt?: string | null
          created_at?: string
          updated_at?: string | null
          expired_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string | null
          is_active?: boolean
          status?: string | null
          plan_id?: string
          is_auto_renewal?: boolean | null
          ai_usages?: number | null
          ai_quota?: number | null
          prompt?: string | null
          created_at?: string
          updated_at?: string | null
          expired_at?: string | null
        }
      }
      plans: {
        Row: {
          id: string
          name: string
          price_per_month: number
          description: string | null
          ai_quota: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          price_per_month: number
          description?: string | null
          ai_quota: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          price_per_month?: number
          description?: string | null
          ai_quota?: number
          created_at?: string | null
          updated_at?: string | null
        }
      }
      balances: {
        Row: {
          id: string
          user_id: string
          balance: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          balance?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          balance?: number
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          external_id: string | null
          invoice_url: string | null
          amount: number
          status: 'pending' | 'paid' | 'expired'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          external_id?: string | null
          invoice_url?: string | null
          amount: number
          status?: 'pending' | 'paid' | 'expired'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          external_id?: string | null
          invoice_url?: string | null
          amount?: number
          status?: 'pending' | 'paid' | 'expired'
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          type: 'topup' | 'usage'
          amount: number
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'topup' | 'usage'
          amount: number
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'topup' | 'usage'
          amount?: number
          description?: string | null
          created_at?: string
        }
      }
    }
  }
}