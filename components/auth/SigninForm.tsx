'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'

export default function SigninForm() {
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
      setMessage('An error occurred. Please try again.')
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
        setMessage('Login berhasil! Redirecting...')
        
        // Add debug logging
        console.log('Login successful:', { user: data.user, session: data.session })
        console.log('Session access token:', data.session.access_token)
        
        // Try immediate redirect first
        console.log('Redirecting to dashboard...')
        window.location.href = '/dashboard'
      } else {
        setMessage('Login gagal. Silakan coba lagi.')
      }
    } catch (error) {
      setMessage('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })
      
      if (error) {
        setMessage('Google sign in failed: ' + error.message)
      }
    } catch (error) {
      // Fallback redirect for demo
      window.location.href = '/dashboard'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm sm:max-w-md">
        <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">
              {step === 'email' 
                ? 'Sign in to your account to continue' 
                : 'Masukkan kode OTP yang telah dikirim'
              }
            </p>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {step === 'email' && (
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-xs sm:text-sm md:text-base text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </button>
            )}

            {step === 'email' && (
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs sm:text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                </div>
              </div>
            )}

            {step === 'email' ? (
              <form onSubmit={handleSendOTP} className="space-y-3 sm:space-y-4">
                <div>
                  <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Email address
                  </label>
                  <Input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 sm:py-3 text-sm md:text-base rounded-lg font-medium"
                >
                  {loading ? 'Sending...' : 'Send Verification Code'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-3 sm:space-y-4">
                <div>
                  <label htmlFor="otp" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Kode OTP
                  </label>
                  <Input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Kode dikirim ke: {email}
                  </p>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 sm:py-3 text-sm md:text-base rounded-lg font-medium"
                >
                  {loading ? 'Memverifikasi...' : 'Verifikasi OTP'}
                </Button>

                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="w-full text-center text-xs sm:text-sm md:text-base text-green-600 hover:text-green-800 transition-colors duration-200"
                >
                  Kembali ke form email
                </button>
              </form>
            )}

            {message && (
              <div className={`p-2 sm:p-3 rounded-lg text-xs sm:text-sm ${
                message.includes('Error') || message.includes('tidak valid') || message.includes('gagal')
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}>
                {message}
              </div>
            )}

            <div className="text-center">
              <p className="text-xs sm:text-sm md:text-base text-gray-600">
                Don't have an account?{' '}
               <a href="/signup" className="text-green-600 hover:text-green-800 font-medium">
                  Sign up
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}