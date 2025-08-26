export interface User {
  id: string
  email: string
  created_at: string
}

export interface Chatbot {
  id: string
  name: string
  status: 'ON' | 'OFF'
  plan: 'Free' | 'Basic' | 'Premium'
  created_at: string
  expires_at: string
}

export interface PricingPlan {
  id: string
  name: string
  price: string
  period: string
  features: string[]
  popular?: boolean
}

export interface Testimonial {
  id: string
  name: string
  role: string
  company: string
  content: string
  avatar: string
}