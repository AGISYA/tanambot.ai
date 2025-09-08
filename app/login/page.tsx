'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Mail, Shield, Chrome } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function LoginPage() {
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cooldownActive, setCooldownActive] = useState(false)
  const [cooldownTime, setCooldownTime] = useState(0)
  
  const COOLDOWN_DURATION = 60 // 60 seconds
  
  const { login, loginWithGoogle, verifyOTP } = useAuth()
  const router = useRouter()

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (cooldownActive) {
      setError(`Tunggu ${cooldownTime} detik sebelum mengirim OTP lagi`)
      toast({
        variant: "destructive",
        title: "Terlalu Cepat",
        description: `Tunggu ${cooldownTime} detik sebelum mengirim OTP lagi`,
      })
      return
    }
    
    if (!email) {
      setError('Email harus diisi')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      await login(email)
      setStep('otp')
      toast({
        variant: "success",
        title: "OTP Sent",
        description: `Kode OTP telah dikirim ke ${email}`,
      })
    } catch (error: any) {
      const errorMessage = error.message || 'Terjadi kesalahan saat mengirim OTP'
      setError(errorMessage)
      
      // Check for rate limit error
      if (error.status === 429 || error.code === 'over_email_send_rate_limit' || errorMessage.includes('email rate limit exceeded') || errorMessage.includes('rate limit')) {
        setCooldownActive(true)
        setCooldownTime(COOLDOWN_DURATION)
        
        // Start countdown
        const interval = setInterval(() => {
          setCooldownTime(prev => {
            if (prev <= 1) {
              clearInterval(interval)
              setCooldownActive(false)
              return 0
            }
            return prev - 1
          })
        }, 1000)
        
        toast({
          variant: "destructive",
          title: "Rate Limit Terlampaui",
          description: `Terlalu banyak permintaan. Tunggu ${COOLDOWN_DURATION} detik sebelum mencoba lagi.`,
        })
      } else {
        toast({
          variant: "destructive",
          title: "Login Error",
          description: errorMessage,
        })
      }
    } finally {
      setLoading(false)
    }
  }
  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')
    
    try {
      await loginWithGoogle()
      // Redirect will be handled by Supabase
    } catch (error: any) {
      const errorMessage = error.message || 'Terjadi kesalahan saat login dengan Google'
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Google Login Error",
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp) {
      setError('Kode OTP harus diisi')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      await verifyOTP(email, otp)
      router.push('/dashboard')
      toast({
        variant: "success",
        title: "Login Successful",
        description: "Selamat datang di dashboard!",
      })
    } catch (error: any) {
      const errorMessage = error.message || 'Kode OTP tidak valid'
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Verification Error",
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center text-green-600 hover:text-green-500 mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Beranda
          </Link>
        </div>

        <Card className="border-green-200">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              {step === 'email' ? 'Masuk ke Akun' : 'Verifikasi OTP'}
            </CardTitle>
            <CardDescription>
              {step === 'email' 
                ? 'Masukkan email Anda untuk mendapatkan kode OTP'
                : `Kami telah mengirim kode OTP ke ${email}`
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {step === 'email' ? (
              <div className="space-y-6">
                {/* Google Login Button */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-gray-300 hover:bg-gray-50"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <Chrome className="h-4 w-4 mr-2" />
                  Masuk dengan Google
                </Button>
                
                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">atau</span>
                  </div>
                </div>
                
                {/* Email Form */}
                <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <Label htmlFor="email">Alamat Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@example.com"
                    className="mt-1"
                    required
                  />
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={loading || cooldownActive}
                >
                  {loading ? (
                    'Mengirim...'
                  ) : cooldownActive ? (
                    `Tunggu ${cooldownTime}s`
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Kirim OTP
                    </>
                  )}
                </Button>
              </form>
              </div>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div>
                  <Label htmlFor="otp">Kode OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Masukkan 6 digit kode OTP"
                    className="mt-1 text-center text-lg tracking-widest"
                    maxLength={6}
                    required
                  />
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={loading}
                >
                  {loading ? (
                    'Memverifikasi...'
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Verifikasi & Login
                    </>
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setStep('email')}
                >
                  Kembali ke Email
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Dengan masuk, Anda menyetujui{' '}
            <a href="#" className="text-green-600 hover:text-green-500">
              Syarat & Ketentuan
            </a>{' '}
            dan{' '}
            <a href="#" className="text-green-600 hover:text-green-500">
              Kebijakan Privasi
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}