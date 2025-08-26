// N8N Client utility functions - Direct webhook approach
import { supabase } from './supabase'

export interface N8NTopUpRequest {
  amount: number
}

export interface N8NTopUpResponse {
  invoice_url: string
}

export class N8NClient {
  private webhookUrl: string
  private webhookToken: string

  constructor() {
    this.webhookUrl = 'https://n8n.tanam.io/webhook/biling/topup-balance'
    this.webhookToken = process.env.NEXT_PUBLIC_N8N_WEBHOOK_TOKEN || ''
  }

  async createTopUpPayment(amount: number): Promise<N8NTopUpResponse> {
    // Get current user for logging purposes
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      throw new Error('User not authenticated')
    }

    const requestData: N8NTopUpRequest = {
      amount: amount
    }

    console.log('🚀 N8N Client - Sending direct request:', {
      url: this.webhookUrl,
      data: requestData
    })
    console.log('🚀 Cek token:', this.webhookToken)


    const response = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${this.webhookToken}`
      },
      body: JSON.stringify(requestData)
    })

    console.log('📡 N8N Client - Response status:', response)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ N8N Client - Error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      })

      // Handle specific HTTP errors
      switch (response.status) {
        case 400:
          throw new Error('Invalid request data. Please check the amount and try again.')
        case 404:
          throw new Error('N8N webhook endpoint not found. Please check the URL.')
        case 422:
          throw new Error('Invalid request data. Please check the amount and try again.')
        case 500:
          throw new Error('N8N server error. Please try again later.')
        default:
          throw new Error(`N8N request failed: ${response.status} - ${errorText || response.statusText}`)
      }
    }

    const data = await response.json()
    console.log('✅ N8N Client - Success response:', data)

    // Validate response structure
    if (!data.invoice_url) {
      throw new Error('Invalid response from N8N: missing invoice_url')
    }

    return data as N8NTopUpResponse
  }

  // Test connection to N8N webhook
  async testConnection(): Promise<boolean> {
    try {
      // Send a test request with minimal data
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ amount: 1000 }) // Test amount
      })

      return response.ok
    } catch (error) {
      console.error('N8N connection test failed:', error)
      return false
    }
  }
}

// Export singleton instance
export const n8nClient = new N8NClient()