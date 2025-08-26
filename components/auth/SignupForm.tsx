'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'

export default function SignupForm() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          channel: 'email',
        },
      })

      if (error) {
        setMessage('Error: ' + error.message)
      } else {
        setMessage('OTP telah dikirim ke email Anda!')
        setStep('otp')
      }
    } catch (error) {
      setMessage('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email'
      })

      if (error) {
        setMessage('OTP tidak valid: ' + error.message)
      } else if (data.user && data.session) {
        setMessage('Registrasi berhasil! Redirecting...')
        
        // Wait longer for session to be properly set and stored
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Force redirect with page reload to ensure fresh session check
        window.location.replace('/dashboard')
      } else {
        setMessage('Registrasi gagal. Silakan coba lagi.')
      }
    } catch (error) {
      setMessage('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md px-4">
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Daftar Akun</h2>
          <p className="text-sm md:text-base text-gray-600 mt-2">
            {step === 'email' 
              ? 'Masukkan email untuk membuat akun' 
              : 'Masukkan kode OTP yang telah dikirim'
            }
          </p>
        </div>

        {step === 'email' ? (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="text-sm md:text-base"
                required
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full py-2 md:py-3 text-sm md:text-lg font-semibold"
            >
              {loading ? 'Mengirim...' : 'Kirim OTP'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                Kode OTP
              </label>
              <Input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                maxLength={6}
                className="text-sm md:text-base"
                required
              />
              <p className="text-xs md:text-sm text-gray-500 mt-1">
                Kode dikirim ke: {email}
              </p>
            </div>

            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full py-2 md:py-3 text-sm md:text-lg font-semibold"
            >
              {loading ? 'Memverifikasi...' : 'Verifikasi OTP'}
            </Button>

            <button
              type="button"
              onClick={() => setStep('email')}
              className="w-full text-center text-sm md:text-base text-green-600 hover:text-green-800 transition-colors duration-200"
            >
              Kembali ke form email
            </button>
          </form>
        )}

        {message && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            message.includes('Error') || message.includes('tidak valid') || message.includes('gagal')
              ? 'bg-red-50 text-red-700 border border-red-200' 
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {message}
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm md:text-base text-gray-600">
            Sudah punya akun?{' '}
           <a href="/signin" className="text-green-600 hover:text-green-800 font-medium">
              Sign In
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}