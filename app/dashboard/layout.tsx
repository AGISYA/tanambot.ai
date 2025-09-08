'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Bot, 
  Wallet, 
  Settings, 
  Building2,
  User,
  LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const sidebarItems = [
    {
      name: 'Chatbot',
      href: '/dashboard',
      icon: Bot,
      badge: 'Beta'
    },
    {
      name: 'Saldo',
      href: '/dashboard/balance',
      icon: Wallet
    },
    {
      name: 'Pengaturan',
      href: '/dashboard/settings',
      icon: Settings
    },
    {
      name: 'Agensi',
      href: '/dashboard/agency',
      icon: Building2
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="hidden sm:flex items-center space-x-2">
              <span className="text-lg font-semibold text-gray-900">tanambot.io</span>
            </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 max-w-48">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="text-sm truncate hidden sm:inline">{user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div className="hidden lg:block w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-4">
            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const isActive = pathname === item.href || (item.href === '/dashboard' && pathname.startsWith('/dashboard/chatbots'))
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
          <div className="flex justify-around py-2">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href || (item.href === '/dashboard' && pathname.startsWith('/dashboard/chatbots'))
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'text-blue-600'
                      : 'text-gray-600'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-xs">{item.name}</span>
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs px-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
        {/* Main Content */}
        <div className="flex-1 pb-16 lg:pb-0">
          {children}
        </div>
      </div>
    </div>
  )
}