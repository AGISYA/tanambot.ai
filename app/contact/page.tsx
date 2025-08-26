import Footer from '@/components/landing/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <Link href="/" className="text-xl sm:text-2xl font-bold text-gray-900">
              TANAM
            </Link>
            <div className="flex items-center space-x-3 sm:space-x-6">
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors duration-200">
                Home
              </Link>
              <Link href="/signin" className="bg-green-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg hover:bg-green-700 transition-colors duration-200">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Hubungi Kami
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 px-4">
              Ada pertanyaan? Tim kami siap membantu Anda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">
                Informasi Kontak
              </h2>
              
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center mr-3 sm:mr-4">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900">Email</h3>
                    <p className="text-sm sm:text-base text-gray-600">tanam@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center mr-3 sm:mr-4">
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900">YouTube Channel</h3>
                    <a 
                      href="https://youtube.com/@tanam" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm sm:text-base text-green-600 hover:text-green-800 transition-colors duration-200"
                    >
                      youtube.com/@tanam
                    </a>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center mr-3 sm:mr-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900">Response Time</h3>
                    <p className="text-sm sm:text-base text-gray-600">24 jam</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">
                Kirim Pesan
              </h2>
              
              <form className="space-y-4 sm:space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Nama
                  </label>
                  <Input type="text" id="name" placeholder="Nama lengkap" className="text-sm sm:text-base" />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Email
                  </label>
                  <Input type="email" id="email" placeholder="email@example.com" className="text-sm sm:text-base" />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Subject
                  </label>
                  <Input type="text" id="subject" placeholder="Topik pesan" className="text-sm sm:text-base" />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Pesan
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    placeholder="Tulis pesan Anda..."
                  />
                </div>

                <Button type="submit" className="w-full text-sm sm:text-base py-2 sm:py-3">
                  Kirim Pesan
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}