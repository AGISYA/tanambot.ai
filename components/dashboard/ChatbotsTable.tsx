'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import AddBotModal from './AddBotModal'
import Link from 'next/link'

interface ChatbotData {
  id: string
  name: string
  status: 'Need Setup' | 'Active' | 'Inactive'
  plan: string
  price: string
  autoRenewal: boolean
  tokenUsage: string
  expiresAt: string
  daysLeft: number
}

const mockChatbots: ChatbotData[] = [
  {
    id: '1',
    name: 'Test',
    status: 'Need Setup',
    plan: 'Basic',
    price: 'Rp 35,000 /month',
    autoRenewal: true,
    tokenUsage: '1,102,100,000',
    expiresAt: '25/08/2025',
    daysLeft: 20
  }
]

export default function ChatbotsTable() {
  const [chatbots, setChatbots] = useState<ChatbotData[]>(mockChatbots)
  const [isAddBotModalOpen, setIsAddBotModalOpen] = useState(false)

  const toggleAutoRenewal = (id: string) => {
    setChatbots(prev => 
      prev.map(bot => 
        bot.id === id 
          ? { ...bot, autoRenewal: !bot.autoRenewal }
          : bot
      )
    )
  }

  const handleAddBotSuccess = () => {
    // Refresh chatbots list or add new chatbot to state
    console.log('New chatbot created successfully')
  }

  return (
    <>
      <div className="bg-white shadow-sm">
        {/* Add Bot Button */}
        <div className="px-4 md:px-6 py-4 border-b border-gray-200">
          <Button
            onClick={() => setIsAddBotModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Bot
          </Button>
        </div>

      {/* Header */}
      <div className="overflow-x-auto -mx-4 md:mx-0">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 md:px-6 text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="text-left py-3 px-4 md:px-6 text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left py-3 px-4 md:px-6 text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Plan</th>
              <th className="text-left py-3 px-4 md:px-6 text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Auto Renewal</th>
              <th className="text-left py-3 px-4 md:px-6 text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">Token Usage</th>
              <th className="text-left py-3 px-4 md:px-6 text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Expires At</th>
              <th className="text-left py-3 px-4 md:px-6 text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {chatbots.map((bot) => (
              <tr key={bot.id} className="hover:bg-gray-50">
                <td className="py-4 px-4 md:px-6">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-green-600 font-medium text-sm">🤖</span>
                    </div>
                    <span className="font-medium text-gray-900">{bot.name}</span>
                  </div>
                </td>
                <td className="py-4 px-4 md:px-6">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
                    <span className="text-orange-600 font-medium text-sm">{bot.status}</span>
                  </div>
                </td>
                <td className="py-4 px-4 md:px-6">
                  <div>
                    <div className="font-medium text-gray-900">{bot.plan}</div>
                    <div className="text-xs md:text-sm text-gray-500">{bot.price}</div>
                  </div>
                </td>
                <td className="py-4 px-4 md:px-6 hidden lg:table-cell">
                  <button
                    onClick={() => toggleAutoRenewal(bot.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      bot.autoRenewal ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        bot.autoRenewal ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </td>
                <td className="py-4 px-4 md:px-6 hidden xl:table-cell">
                  <span className="text-gray-900 font-mono text-sm">{bot.tokenUsage}</span>
                </td>
                <td className="py-4 px-4 md:px-6">
                  <div>
                    <div className="text-gray-900 font-medium">{bot.expiresAt}</div>
                    <div className="text-xs md:text-sm text-gray-500">({bot.daysLeft} days left)</div>
                  </div>
                </td>
                <td className="py-4 px-4 md:px-6">
                  <Link href={`/dashboard/chatbots/${bot.id}/manage`}>
                    <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50">
                      Manage
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 md:px-6 py-4 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-xs md:text-sm text-gray-500">
          Showing 1 to 1 of 1 chatbots
        </div>
        <div className="flex items-center space-x-2 text-xs md:text-sm">
          <button className="px-2 md:px-3 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-50" disabled>
            ← Previous
          </button>
          <span className="px-2 md:px-3 py-1 text-gray-700">Page 1 of 1</span>
          <button className="px-2 md:px-3 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-50" disabled>
            Next →
          </button>
        </div>
      </div>
      </div>

      <AddBotModal
        isOpen={isAddBotModalOpen}
        onClose={() => setIsAddBotModalOpen(false)}
        onSuccess={handleAddBotSuccess}
      />
    </>
  )
}