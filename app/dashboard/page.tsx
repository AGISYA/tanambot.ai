'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import ChatbotsTable from '@/components/dashboard/ChatbotsTable'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getSession = async () => {
      try {
        console.log('Dashboard: Checking session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        console.log('Dashboard session check:', { session, error })
        
        if (error) {
          console.error('Session error:', error)
        }

        if (!session) {
          console.log('No session found, redirecting to signin...')
          window.location.href = '/signin'
          return
        }

        console.log('Session found, setting user:', session.user)
        setUser(session.user)
      } catch (error) {
        console.error('Dashboard auth error:', error)
        window.location.href = '/signin'
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', { event, session })
        if (event === 'SIGNED_OUT' || !session) {
          console.log('Signed out or no session, redirecting...')
          window.location.href = '/signin'
        } else if (session) {
          console.log('Session available, setting user:', session.user)
          setUser(session.user)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full">
      <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-green-800">
          Welcome back, {user.email}! 🎉
        </p>
      </div>
      <ChatbotsTable />
    </div>
  )
}