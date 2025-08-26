'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const [showProfile, setShowProfile] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUser(session.user)
        }
      } catch (error) {
        console.error('Error getting user:', error)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser(session.user)
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error logging out:', error)
      } else {
        window.location.href = '/signin'
      }
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const getUserInitials = (email: string) => {
    return email.charAt(0).toUpperCase()
  }

  const getUserDisplayName = (user: any) => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
    }
    if (user?.email) {
      const emailPart = user.email.split('@')[0]
      return emailPart.length > 20 ? emailPart.substring(0, 20) + '...' : emailPart
    }
    return 'User'
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          {/* Page title will be handled by individual pages */}
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Profile Dropdown */}
          <div className="relative">
            {loading ? (
              <div className="flex items-center space-x-2 p-1 sm:p-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : user ? (
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center space-x-1 sm:space-x-2 p-1 sm:p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-xs sm:text-sm font-medium text-green-600">
                    {getUserInitials(user.email)}
                  </span>
                </div>
                <div className="hidden md:block">
                  <div className="text-xs sm:text-sm font-medium text-gray-900 text-left">
                    {getUserDisplayName(user)}
                  </div>
                </div>
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            ) : (
              <div className="flex items-center space-x-1 sm:space-x-2 p-1 sm:p-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xs sm:text-sm font-medium text-gray-600">?</span>
                </div>
              </div>
            )}

            {showProfile && (
              <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                {user && (
                  <>
                    <div className="px-4 py-2 border-b border-gray-100">
                      <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                        {getUserDisplayName(user)}
                      </div>
                      <div className="text-xs text-gray-500 truncate">{user.email}</div>
                    </div>
                  </>
                )}
                <a
                  href="#"
                  className="block px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100"
                >
                  Profile
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100"
                >
                  Settings
                </a>
                <hr className="my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}