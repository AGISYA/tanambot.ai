'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import AddCreditModal from '@/components/dashboard/AddCreditModal'
import { getCurrentUser, getUserBalance, getUserTransactions, getUserPayments } from '@/lib/supabase-queries'
import { Transaction, Payment } from '@/types/database'

export default function BalancePage() {
  const [activeTab, setActiveTab] = useState<'transactions' | 'payments'>('transactions')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Data states
  const [currentBalance, setCurrentBalance] = useState<number>(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [payments, setPayments] = useState<Payment[]>([])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const user = await getCurrentUser()
      if (!user) {
        setError('User not authenticated')
        return
      }

      // Fetch all data in parallel
      const [balance, transactionsList, paymentsList] = await Promise.all([
        getUserBalance(user.id),
        getUserTransactions(user.id),
        getUserPayments(user.id)
      ])

      setCurrentBalance(balance)
      setTransactions(transactionsList)
      setPayments(paymentsList)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleTopUpSuccess = () => {
    // Refresh data after successful top up
    fetchData()
    setIsModalOpen(false)
  }

  const formatCurrency = (amount: number) => {
    return `Rp ${Math.abs(amount).toLocaleString('id-ID')}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading balance data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchData} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-full overflow-x-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Balance</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 hidden sm:block">Manage your balance and view transaction history</p>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <Button variant="outline" className="text-gray-600 border-gray-300">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="hidden sm:inline">Redeem</span>
              </Button>
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base px-3 sm:px-4"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="hidden sm:inline">Add Credit</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Current Credits */}
        <div className="bg-white px-4 sm:px-6 py-4 sm:py-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center mr-3 sm:mr-4">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Current Credits</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{formatCurrency(currentBalance)}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white">
          <div className="border-b border-gray-200">
            <div className="flex px-4 sm:px-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab('transactions')}
                className={`px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap ${
                  activeTab === 'transactions'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="hidden sm:inline">Transactions ({transactions.length})</span>
                <span className="sm:hidden">Trans ({transactions.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap ${
                  activeTab === 'payments'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span className="hidden sm:inline">Payments ({payments.length})</span>
                <span className="sm:hidden">Pay ({payments.length})</span>
              </button>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto min-w-full">
            {activeTab === 'transactions' ? (
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-3 sm:px-6 py-6 sm:py-8 text-center text-gray-500 text-sm">
                        No transactions found
                      </td>
                    </tr>
                  ) : (
                    transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                          {formatDate(transaction.created_at)}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 max-w-xs sm:max-w-md">
                          {transaction.description || 'No description'}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transaction.type === 'topup' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            <svg className="w-2 h-2 sm:w-3 sm:h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d={transaction.type === 'topup' ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"} />
                            </svg>
                            <span className="hidden sm:inline">{transaction.type === 'topup' ? 'Top Up' : 'Usage'}</span>
                            <span className="sm:hidden">{transaction.type === 'topup' ? '+' : '-'}</span>
                          </span>
                        </td>
                        <td className={`px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium ${
                          transaction.type === 'topup' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'topup' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full min-w-[700px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">External ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No payments found
                      </td>
                    </tr>
                  ) : (
                    payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(payment.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                          {payment.external_id || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            payment.status === 'paid' 
                              ? 'bg-green-100 text-green-800'
                              : payment.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d={payment.status === 'paid' 
                                  ? "M5 13l4 4L19 7"
                                  : payment.status === 'pending'
                                  ? "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  : "M6 18L18 6M6 6l12 12"
                                } />
                            </svg>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {payment.status === 'pending' && payment.invoice_url ? (
                            <a 
                              href={payment.invoice_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                                Pay
                              </Button>
                            </a>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <AddCreditModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleTopUpSuccess}
      />
    </div>
  )
}