export interface Balance {
  id: string
  user_id: string
  balance: number
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  type: 'topup' | 'usage'
  amount: number
  description: string | null
  created_at: string
}

export interface Payment {
  id: string
  user_id: string
  external_id: string | null
  invoice_url: string | null
  amount: number
  status: 'pending' | 'paid' | 'expired'
  created_at: string
}