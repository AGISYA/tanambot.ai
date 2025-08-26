'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getCurrentUser } from '@/lib/supabase-queries'
import { n8nClient } from '@/lib/n8n-client'

interface AddCreditModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function AddCreditModal({ isOpen, onClose, onSuccess }: AddCreditModalProps) {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const predefinedAmounts = [50000, 100000, 200000]

  const handleTopUp = async () => {
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const user = await getCurrentUser()
      if (!user) {
        setError('User not authenticated')
        return
      }

      console.log('🚀 Sending direct top up request to N8N webhook for amount:', Number(amount))

      // Send direct request to N8N webhook
      const response = await n8nClient.createTopUpPayment(Number(amount))

      console.log('✅ N8N webhook response received:', response)

      if (response.invoice_url) {
        console.log('🔗 Redirecting to payment URL:', response.invoice_url)

        // Reset form
        setAmount('')
        
        // Close modal
        onClose()
        
        // Redirect to invoice URL
        window.location.href = response.invoice_url
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess()
        }
      } else {
        throw new Error('No invoice URL received from N8N')
      }

    } catch (err) {
      console.error('💥 N8N webhook error:', err)
      
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to create payment. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setAmount('')
      setError(null)
      onClose()
    }
  }

  return (
    isOpen ? (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-lg">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Top Up Balance
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50 p-1"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Amount (Rp)
            </label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full text-sm sm:text-base"
              disabled={loading}
              min="1"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {predefinedAmounts.map((preset) => (
              <button
                key={preset}
                onClick={() => setAmount(preset.toString())}
                disabled={loading}
                className="px-2 sm:px-3 py-2 text-xs sm:text-sm border border-green-300 rounded-lg hover:bg-green-50 hover:border-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="hidden sm:inline">Rp </span>{preset.toLocaleString('id-ID')}
              </button>
            ))}
          </div>

          {error && (
            <div className="p-2 sm:p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded-lg border border-blue-200">
            <p>• Direct N8N Webhook Integration</p>
            <p>• Webhook URL: https://n8n.tanam.io/webhook/biling/topup-balance</p>
            <p>• Payment Gateway: N8N → Xendit</p>
          </div>

          <Button 
            onClick={handleTopUp}
            disabled={loading || !amount || Number(amount) <= 0}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2"></div>
                Creating Payment...
              </div>
            ) : (
              'Create Payment'
            )}
          </Button>
        </div>
      </div>
      </div>
      </div>
    ) : null
  )
}