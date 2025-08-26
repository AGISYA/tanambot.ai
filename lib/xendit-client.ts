// Xendit Client utility functions
import { supabase } from './supabase'

export interface XenditInvoiceRequest {
  external_id: string
  amount: number
  payer_email: string
  description: string
  invoice_duration?: number
  success_redirect_url?: string
  failure_redirect_url?: string
}

export interface XenditInvoiceResponse {
  id: string
  external_id: string
  user_id: string
  status: string
  merchant_name: string
  amount: number
  payer_email: string
  description: string
  invoice_url: string
  expiry_date: string
  created: string
  updated: string
}

export interface XenditCallbackData {
  id: string
  external_id: string
  status: 'PENDING' | 'PAID' | 'SETTLED' | 'EXPIRED'
  amount: number
  paid_amount?: number
  bank_code?: string
  paid_at?: string
}

export class XenditClient {
  private secretKey: string
  private baseUrl: string

  constructor() {
    this.secretKey = process.env.NEXT_PUBLIC_XENDIT_SECRET_KEY || ''
    this.baseUrl = 'https://api.xendit.co'
  }

  private getAuthHeaders() {
    const auth = btoa(`${this.secretKey}:`)
    return {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }

  async createInvoice(amount: number, description?: string): Promise<XenditInvoiceResponse> {
    // Get current user
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      throw new Error('User not authenticated')
    }

    const external_id = `topup_${session.user.id}_${Date.now()}`
    const requestData: XenditInvoiceRequest = {
      external_id,
      amount,
      payer_email: session.user.email || '',
      description: description || `Top up balance Rp ${amount.toLocaleString('id-ID')}`,
      invoice_duration: 86400, // 24 hours
      success_redirect_url: `${window.location.origin}/dashboard/balance?status=success`,
      failure_redirect_url: `${window.location.origin}/dashboard/balance?status=failed`
    }

    console.log('🚀 Xendit - Creating invoice:', {
      url: `${this.baseUrl}/v2/invoices`,
      data: requestData
    })

    const response = await fetch(`${this.baseUrl}/v2/invoices`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestData)
    })

    console.log('📡 Xendit - Response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Xendit - Error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      })

      // Handle specific HTTP errors
      switch (response.status) {
        case 400:
          throw new Error('Invalid request data. Please check the amount and try again.')
        case 401:
          throw new Error('Authentication failed. Please check your Xendit API key.')
        case 403:
          throw new Error('Access forbidden. Please check your Xendit account permissions.')
        case 422:
          throw new Error('Invalid request parameters. Please check the amount and try again.')
        case 500:
          throw new Error('Xendit server error. Please try again later.')
        default:
          throw new Error(`Xendit request failed: ${response.status} - ${errorText || response.statusText}`)
      }
    }

    const data = await response.json()
    console.log('✅ Xendit - Invoice created:', data)

    return data as XenditInvoiceResponse
  }

  async getInvoice(invoiceId: string): Promise<XenditInvoiceResponse> {
    console.log('🔍 Xendit - Getting invoice:', invoiceId)

    const response = await fetch(`${this.baseUrl}/v2/invoices/${invoiceId}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Xendit - Get invoice error:', {
        status: response.status,
        body: errorText
      })
      throw new Error(`Failed to get invoice: ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ Xendit - Invoice retrieved:', data)

    return data as XenditInvoiceResponse
  }

  // Test connection to Xendit
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/balance`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      })

      return response.ok
    } catch (error) {
      console.error('Xendit connection test failed:', error)
      return false
    }
  }

  // Handle webhook callback from Xendit
  static async handleCallback(callbackData: XenditCallbackData): Promise<void> {
    console.log('📨 Xendit - Webhook callback received:', callbackData)

    if (callbackData.status === 'PAID' || callbackData.status === 'SETTLED') {
      // Update user balance in database
      try {
        // Extract user_id from external_id (format: topup_userId_timestamp)
        const parts = callbackData.external_id.split('_')
        if (parts.length >= 2 && parts[0] === 'topup') {
          const userId = parts[1]
          
          // Here you would typically update the user's balance in your database
          // For now, we'll just log it
          console.log('✅ Payment confirmed for user:', userId, 'Amount:', callbackData.amount)
          
          // You can add database update logic here
          // await updateUserBalance(userId, callbackData.amount)
        }
      } catch (error) {
        console.error('❌ Error processing payment callback:', error)
      }
    }
  }
}

// Export singleton instance
export const xenditClient = new XenditClient()