'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface AddBotModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

type Step = 'plan' | 'info' | 'summary'
type BillingPeriod = 'Monthly' | '3 Months' | '6 Months' | '12 Months'

export default function AddBotModal({ isOpen, onClose, onSuccess }: AddBotModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>('plan')
  const [selectedPlan, setSelectedPlan] = useState('Basic')
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('Monthly')
  const [chatbotName, setChatbotName] = useState('')
  const [loading, setLoading] = useState(false)

  const plans = {
    Basic: {
      price: 'Rp105K',
      period: '/3months',
      features: [
        '1.00MB storage',
        '100,000 tokens/month'
      ]
    }
  }

  const billingPeriods: BillingPeriod[] = ['Monthly', '3 Months', '6 Months', '12 Months']

  const handleClose = () => {
    if (!loading) {
      setCurrentStep('plan')
      setSelectedPlan('Basic')
      setBillingPeriod('Monthly')
      setChatbotName('')
      onClose()
    }
  }

  const handleNext = () => {
    if (currentStep === 'plan') {
      setCurrentStep('info')
    } else if (currentStep === 'info') {
      setCurrentStep('summary')
    }
  }

  const handleBack = () => {
    if (currentStep === 'info') {
      setCurrentStep('plan')
    } else if (currentStep === 'summary') {
      setCurrentStep('info')
    }
  }

  const handleCreateChatbot = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setLoading(false)
    
    if (onSuccess) {
      onSuccess()
    }
    handleClose()
  }

  const getStepNumber = (step: Step) => {
    switch (step) {
      case 'plan': return 1
      case 'info': return 2
      case 'summary': return 3
      default: return 1
    }
  }

  const isStepActive = (step: Step) => {
    return getStepNumber(step) <= getStepNumber(currentStep)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New Chatbot</h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Steps Indicator */}
        <div className="flex items-center justify-center py-6 px-6">
          <div className="flex items-center space-x-4">
            {/* Step 1 */}
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                isStepActive('plan') ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900">Select Plan</span>
            </div>

            {/* Connector */}
            <div className="w-8 h-px bg-gray-300"></div>

            {/* Step 2 */}
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                isStepActive('info') ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900">Chatbot Info</span>
            </div>

            {/* Connector */}
            <div className="w-8 h-px bg-gray-300"></div>

            {/* Step 3 */}
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                isStepActive('summary') ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                3
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900">Summary</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {currentStep === 'plan' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose Your Plan</h3>
                <p className="text-gray-600">Select the plan that best fits your chatbot needs</p>
              </div>

              {/* Billing Period */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Billing Period</label>
                <div className="flex space-x-2">
                  {billingPeriods.map((period) => (
                    <button
                      key={period}
                      onClick={() => setBillingPeriod(period)}
                      className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                        billingPeriod === period
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              {/* Plan Selection */}
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Basic</h4>
                      <div className="flex items-baseline">
                        <span className="text-2xl font-bold text-gray-900">Rp105K</span>
                        <span className="text-gray-600 ml-1">/3months</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Rp35K/month</p>
                    </div>
                    <input
                      type="radio"
                      name="plan"
                      value="Basic"
                      checked={selectedPlan === 'Basic'}
                      onChange={(e) => setSelectedPlan(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                  </div>
                  <ul className="space-y-2">
                    {plans.Basic.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'info' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Chatbot Information</h3>
                <p className="text-gray-600">Enter your chatbot details</p>
              </div>

              <div>
                <label htmlFor="chatbotName" className="block text-sm font-medium text-gray-700 mb-2">
                  Chatbot Name
                </label>
                <Input
                  id="chatbotName"
                  type="text"
                  value={chatbotName}
                  onChange={(e) => setChatbotName(e.target.value)}
                  placeholder="Enter chatbot name"
                  className="w-full"
                />
              </div>
            </div>
          )}

          {currentStep === 'summary' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Summary & Confirmation</h3>
                <p className="text-gray-600">Review your chatbot configuration before creating</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan:</span>
                  <span className="font-medium text-gray-900">Basic</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Billing:</span>
                  <span className="font-medium text-gray-900">Monthly</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium text-gray-900">{chatbotName || 'X'}</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-900 font-semibold">Cost:</span>
                    <span className="font-bold text-gray-900">Rp35.000/month</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Your balance will be reduced by Rp35.000 every month according to your selected plan.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 'plan' || loading}
            className="flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Button>

          {currentStep === 'summary' ? (
            <Button
              onClick={handleCreateChatbot}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                'Create Chatbot'
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={currentStep === 'info' && !chatbotName.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
            >
              Next
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}