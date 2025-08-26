import { supabase } from './supabase'
import { Balance, Transaction, Payment } from '@/types/database'

export async function getCurrentUser() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session?.user || null
}

export async function getUserBalance(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('balances')
    .select('balance')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return Number(data?.balance || 0)
}

export async function getUserTransactions(userId: string): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getUserPayments(userId: string): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createTransaction(
  userId: string,
  type: 'topup' | 'usage',
  amount: number,
  description: string
): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      type,
      amount,
      description
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateUserBalance(userId: string, newBalance: number): Promise<void> {
  // First try to update existing balance
  const { data: existingBalance } = await supabase
    .from('balances')
    .select('id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle()

  if (existingBalance) {
    // Update existing balance
    const { error } = await supabase
      .from('balances')
      .update({ balance: newBalance })
      .eq('user_id', userId)

    if (error) throw error
  } else {
    // Insert new balance record
    const { error } = await supabase
      .from('balances')
      .insert({
        user_id: userId,
        balance: newBalance
      })

    if (error) throw error
  }
}

export async function topUpBalance(userId: string, amount: number): Promise<void> {
  // Get current balance
  const currentBalance = await getUserBalance(userId)
  const newBalance = currentBalance + amount

  // Create payment record (uang masuk)
  await createPayment(
    userId,
    amount,
    `topup_${Date.now()}`, // external_id
    null, // invoice_url (null untuk direct top up)
    'paid' // status langsung paid untuk direct top up
  )

  // Create transaction record
  await createTransaction(
    userId,
    'topup',
    amount,
    `Top up balance Rp ${amount.toLocaleString('id-ID')}`
  )

  // Update balance
  await updateUserBalance(userId, newBalance)
}

export async function createPayment(
  userId: string,
  amount: number,
  externalId: string | null = null,
  invoiceUrl: string | null = null,
  status: 'pending' | 'paid' | 'expired' = 'pending'
): Promise<Payment> {
  const { data, error } = await supabase
    .from('payments')
    .insert({
      user_id: userId,
      external_id: externalId,
      invoice_url: invoiceUrl,
      amount,
      status
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updatePaymentStatus(
  paymentId: string,
  status: 'pending' | 'paid' | 'expired'
): Promise<void> {
  const { error } = await supabase
    .from('payments')
    .update({ status })
    .eq('id', paymentId)

  if (error) throw error
}

export async function processPaymentGateway(userId: string, amount: number): Promise<Payment> {
  // Create payment record dengan status pending dan invoice URL
  const payment = await createPayment(
    userId,
    amount,
    `payment_${Date.now()}`,
    `https://payment-gateway.example.com/invoice/${Date.now()}`,
    'pending'
  )

  return payment
}

export async function addUsageTransaction(userId: string, amount: number, description: string): Promise<void> {
  // Get current balance
  const currentBalance = await getUserBalance(userId)
  
  if (currentBalance < amount) {
    throw new Error('Insufficient balance')
  }
  
  const newBalance = currentBalance - amount

  // Create transaction record (uang keluar)
  await createTransaction(
    userId,
    'usage',
    amount,
    description
  )

  // Update balance
  await updateUserBalance(userId, newBalance)
}