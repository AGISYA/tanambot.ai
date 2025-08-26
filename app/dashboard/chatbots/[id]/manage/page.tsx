'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

interface ManageChatbotPageProps {
  params: {
    id: string
  }
}

type TabType = 'instructions' | 'usages' | 'plan'

export default function ManageChatbotPage({ params }: ManageChatbotPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>('instructions')
  const [instructions, setInstructions] = useState('Kamu adalah asisten Pintar')
  const [chatMessage, setChatMessage] = useState('')

  // Mock data - in real app, fetch based on params.id
  const chatbotData = {
    id: params.id,
    name: 'Test',
    status: 'Active',
    plan: 'N/A',
    monthlyPrice: 'N/A',
    expiresOn: '11/9/2025',
    usedRequests: 10,
    totalRequests: 1000,
    remainingRequests: 990,
    usagePercentage: 1.0,
    chatbotName: 'Bot Pertamaku',
    created: '8/12/2025',
    totalQuota: '1,000 requests',
    aiQuota: '1,000 requests',
    aiUsage: '10 requests'
  }

  const renderInstructionsTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column - Instructions */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Chatbot Instructions</h2>
          <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
            Generate Instruction
          </Button>
        </div>
        
        <div>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            placeholder="Enter your chatbot instructions..."
          />
        </div>
      </div>

      {/* Right Column - Chat Preview */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Chat Preview</h2>
          <Button variant="outline" className="text-gray-600 border-gray-200 hover:bg-gray-50">
            Restart Chat
          </Button>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 h-80 flex flex-col">
          {/* Chat Messages */}
          <div className="flex-1 space-y-4 mb-4">
            <div className="flex justify-end">
              <div className="bg-blue-600 text-white px-4 py-2 rounded-lg max-w-xs">
                Halo, kamu siapa?
              </div>
            </div>
            
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg max-w-xs">
                <div className="text-xs text-gray-500 mb-1">Test 09:47</div>
                <div className="text-gray-900">
                  Halo! Saya Aria, asisten digital dari Suraspot. 
                  Senang bisa membantu Anda hari ini. Ada 
                  yang bisa saya bantu atau ingin tahu lebih 
                  banyak tentang produk Suraspot?
                </div>
              </div>
            </div>
          </div>

          {/* Chat Input */}
          <div className="flex space-x-2">
            <Input
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderUsagesTab = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Usages</h2>
        <p className="text-gray-600">Monitor your chatbot's request usage and quota</p>
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Used Requests</h3>
          <div className="text-3xl font-bold text-gray-900">{chatbotData.usedRequests}</div>
          <div className="text-sm text-gray-500">of 1,000 total</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Remaining Requests</h3>
          <div className="text-3xl font-bold text-green-600">{chatbotData.remainingRequests}</div>
          <div className="text-sm text-gray-500">requests left</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Usage Percentage</h3>
          <div className="text-3xl font-bold text-blue-600">{chatbotData.usagePercentage}%</div>
          <div className="text-sm text-gray-500">of total quota</div>
        </div>
      </div>

      {/* Chatbot Information */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Chatbot Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Chatbot Name</h4>
              <div className="text-gray-900">{chatbotData.chatbotName}</div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Created</h4>
              <div className="text-gray-900">{chatbotData.created}</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Status</h4>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-green-600 font-medium">{chatbotData.status}</span>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Total Quota</h4>
              <div className="text-gray-900">{chatbotData.totalQuota}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderPlanTab = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Plan Information</h2>
      </div>

      {/* Plan Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-500">Current Plan</h3>
          </div>
          <div className="text-2xl font-bold text-gray-900">{chatbotData.plan}</div>
          <div className="text-sm text-gray-500">No description available</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-500">Monthly Price</h3>
          </div>
          <div className="text-2xl font-bold text-gray-900">{chatbotData.monthlyPrice}</div>
          <div className="text-sm text-gray-500">per month</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8a2 2 0 100-4 2 2 0 000 4zm0 0v4a2 2 0 002 2h6a2 2 0 002-2v-4a2 2 0 00-2-2H10a2 2 0 00-2 2z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-500">Expires On</h3>
          </div>
          <div className="text-2xl font-bold text-gray-900">{chatbotData.expiresOn}</div>
          <div className="text-sm text-gray-500">subscription end date</div>
        </div>
      </div>

      {/* Usage Summary */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Usage Summary</h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Requests used this month</span>
              <span className="font-medium">{chatbotData.usedRequests} / {chatbotData.totalRequests}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${(chatbotData.usedRequests / chatbotData.totalRequests) * 100}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">{chatbotData.remainingRequests} requests remaining</div>
          </div>
        </div>
      </div>

      {/* Plan Details */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Plan Details</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Plan Name</span>
            <span className="font-medium text-gray-900">{chatbotData.plan}</span>
          </div>
          
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Monthly Price</span>
            <span className="font-medium text-gray-900">{chatbotData.monthlyPrice}</span>
          </div>
          
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">AI Quota</span>
            <span className="font-medium text-gray-900">{chatbotData.aiQuota}</span>
          </div>
          
          <div className="flex justify-between py-3">
            <span className="text-gray-600">AI Usage</span>
            <span className="font-medium text-gray-900">{chatbotData.aiUsage}</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/chatbots">
                <Button variant="outline" size="sm">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Chatbots
                </Button>
              </Link>
              <div className="text-2xl font-bold text-gray-900">{chatbotData.name}</div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{chatbotData.name}</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  <span className="text-sm text-green-600 font-medium">{chatbotData.status}</span>
                </div>
              </div>
              
              {activeTab === 'instructions' && (
                <>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Share
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Save Changes
                  </Button>
                </>
              )}
              
              {activeTab === 'usages' && (
                <Button variant="outline" className="text-gray-600 border-gray-200 hover:bg-gray-50">
                  Export
                </Button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('instructions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'instructions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Instructions
            </button>
            <button
              onClick={() => setActiveTab('usages')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'usages'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Usages
            </button>
            <button
              onClick={() => setActiveTab('plan')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'plan'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Plan
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'instructions' && renderInstructionsTab()}
        {activeTab === 'usages' && renderUsagesTab()}
        {activeTab === 'plan' && renderPlanTab()}
      </div>
    </div>
  )
}