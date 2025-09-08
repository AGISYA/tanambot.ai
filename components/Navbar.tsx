'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, LogOut } from 'lucide-react'

export function Navbar() {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-green-600">
              tanambot.io
            </Link>
          </div>

          <div className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
              Beranda
            </Link>
            <Link href="#features" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
              Fitur
            </Link>
            <Link href="#pricing" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
              Harga
            </Link>
            <Link href="#contact" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
              Kontak
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-green-600 text-green-600 hover:bg-green-50">
                    <User className="h-4 w-4 mr-2" />
                    {user.email}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dasbor</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  Masuk
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}