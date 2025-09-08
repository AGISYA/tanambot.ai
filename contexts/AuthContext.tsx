'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import Cookies from 'js-cookie'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  verifyOTP: (email: string, token: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      
      if (session?.access_token) {
        Cookies.set('auth-token', session.access_token, { expires: 7 })
      }
      
      setLoading(false)
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        if (session?.access_token) {
          Cookies.set('auth-token', session.access_token, { expires: 7 })
        } else {
          Cookies.remove('auth-token')
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      }
    })
    if (error) throw error
  }

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    })
    if (error) throw error
  }
  const verifyOTP = async (email: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    })
    if (error) throw error
    
    // Create balance record if user is new
    if (data.user) {
      // Check if balance record exists first
      const { data: existingBalance } = await supabase
        .from('balances')
        .select('id')
        .eq('user_id', data.user.id)
        .maybeSingle()
      
      // Only create if doesn't exist
      if (!existingBalance) {
        const { error: balanceError } = await supabase
          .from('balances')
          .insert({ user_id: data.user.id, balance: 0 })
        
        if (balanceError) console.error('Error creating balance:', balanceError)
      }
    }
  }

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    Cookies.remove('auth-token')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, verifyOTP, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}