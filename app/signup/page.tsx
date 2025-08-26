import SignupForm from '@/components/auth/SignupForm'
import Link from 'next/link'

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-4">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row">
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-4">
          <div className="max-w-md text-center lg:text-left">
            <Link href="/" className="inline-block mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">TANAM</h1>
            </Link>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Mulai Journey Chatbot WhatsApp Anda
            </h2>
            <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">
              Bergabung dengan 500+ bisnis yang sudah menggunakan TANAM untuk meningkatkan customer engagement.
            </p>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm sm:text-base text-gray-600">Setup mudah dalam 5 menit</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm sm:text-base text-gray-600">Gratis trial 7 hari</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm sm:text-base text-gray-600">Support 24/7</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
          <SignupForm />
        </div>
      </div>
    </main>
  )
}