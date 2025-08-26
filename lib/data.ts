import { PricingPlan, Testimonial } from '@/types'

export const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 'Rp 0',
    period: '/bulan',
    features: [
      '1 Chatbot aktif',
      '100 pesan/bulan',
      'Template dasar',
      'Support email'
    ]
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 'Rp 299.000',
    period: '/bulan',
    popular: true,
    features: [
      '5 Chatbot aktif',
      '5.000 pesan/bulan',
      'AI response',
      'Analytics dasar',
      'WhatsApp API resmi',
      'Priority support'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 'Rp 999.000',
    period: '/bulan',
    features: [
      'Unlimited chatbots',
      'Unlimited pesan',
      'Advanced AI',
      'Analytics lengkap',
      'Custom integrations',
      'Dedicated support',
      'White-label'
    ]
  }
]

export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Andi Wijaya',
    role: 'CEO',
    company: 'TechStart Indonesia',
    content: 'TANAM chatbot sangat membantu bisnis kami. Response time 24/7 dan pelanggan lebih puas!',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: '2',
    name: 'Sari Dewi',
    role: 'Marketing Director',
    company: 'Fashion Store',
    content: 'Integrasi yang mudah dan fitur AI yang pintar. Penjualan online naik 40% sejak pakai TANAM.',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: '3',
    name: 'Budi Santoso',
    role: 'Owner',
    company: 'Resto Nusantara',
    content: 'Dashboard yang user-friendly dan statistik yang detail. Sangat membantu menganalisa customer behavior.',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  }
]

export const features = [
  {
    id: '1',
    title: 'Balasan Otomatis 24/7',
    description: 'Chatbot yang selalu aktif melayani pelanggan kapan saja',
    icon: '🤖'
  },
  {
    id: '2',
    title: 'WhatsApp API Resmi',
    description: 'Integrasi langsung dengan WhatsApp Business API',
    icon: '📱'
  },
  {
    id: '3',
    title: 'AI Pintar & Personal',
    description: 'Teknologi AI untuk respon yang contextual dan personal',
    icon: '🧠'
  },
  {
    id: '4',
    title: 'Analytics & Laporan',
    description: 'Statistik lengkap dan insight mendalam tentang percakapan',
    icon: '📊'
  }
]