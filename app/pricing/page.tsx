import Pricing from '@/components/landing/Pricing'
import Footer from '@/components/landing/Footer'
import Link from 'next/link'

export default function PricingPage() {
  return (
    <main className="min-h-screen">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              TANAM
            </Link>
            <div className="flex items-center space-x-6">
              <Link href="/" className="text-gray-700 hover:text-green-600 transition-colors duration-200">
                Home
              </Link>
              <Link href="/signin" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="py-20">
        <div className="container mx-auto px-4 max-w-2xl text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Pricing Plans
          </h1>
          <p className="text-xl text-gray-600">
            Pilih paket yang sesuai dengan kebutuhan bisnis Anda
          </p>
        </div>
        <Pricing />
      </section>

      <Footer />
    </main>
  )
}