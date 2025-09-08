import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Zap, Shield, Bot, Play, Mail, MessageSquare } from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-green-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Buat Chatbot AI WhatsApp Anda dalam Hitungan Menit
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Buat chatbot yang powerful dan cerdas untuk WhatsApp tanpa coding. 
            Cepat, aman, dan bertenaga AI.
          </p>
          <Link href="/login">
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 text-lg px-8 py-3">
              Mulai Sekarang
            </Button>
          </Link>
        </div>
      </section>

      {/* YouTube Demo Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Lihat Cara Kerjanya
            </h2>
            <p className="text-xl text-gray-600">
              Tonton demo kami untuk memahami betapa mudahnya membuat chatbot Anda
            </p>
          </div>
          
          <div className="relative aspect-video rounded-lg overflow-hidden shadow-2xl">
            <iframe
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="ChatBot Builder Demo"
              className="w-full h-full"
              allowFullScreen
            />
          </div>
          
          <div className="text-center mt-8">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <Play className="h-4 w-4 mr-2" />
              Coba Sendiri
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Mengapa Memilih Platform Kami?
            </h2>
            <p className="text-xl text-gray-600">
              Semua yang Anda butuhkan untuk membuat chatbot yang luar biasa
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-green-200 hover:border-green-400 transition-colors">
              <CardContent className="p-8 text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Zap className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Super Cepat</h3>
                <p className="text-gray-600">
                  Buat dan deploy chatbot Anda dalam hitungan menit, bukan hari. Interface intuitif kami membuatnya mudah.
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-200 hover:border-green-400 transition-colors">
              <CardContent className="p-8 text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Aman & Terpercaya</h3>
                <p className="text-gray-600">
                  Keamanan tingkat enterprise dengan uptime 99.9%. Data dan percakapan Anda terlindungi.
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-200 hover:border-green-400 transition-colors">
              <CardContent className="p-8 text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Bot className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Bertenaga AI</h3>
                <p className="text-gray-600">
                  Teknologi AI canggih yang memahami konteks dan memberikan percakapan yang natural.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-16 bg-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Siap untuk Memulai?
          </h2>
          <p className="text-xl text-white opacity-90 mb-8">
            Butuh bantuan atau ada pertanyaan? Tim support kami siap membantu Anda.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
                <MessageSquare className="h-5 w-5 mr-2" />
                Mulai Buat Sekarang
              </Button>
            </Link>
            
            <a href="mailto:tanamai@gmail.com">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                <Mail className="h-5 w-5 mr-2" />
                Hubungi Support
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400 mb-4">
              tanambot.io
            </div>
            <p className="text-gray-400 mb-8">
              Buat chatbot AI WhatsApp yang powerful dalam hitungan menit
            </p>
            
            <div className="border-t border-gray-800 pt-8">
              <p className="text-gray-500">
                © 2025 tanambot.io. Semua hak dilindungi.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}