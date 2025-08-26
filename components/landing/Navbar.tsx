'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 px-2 sm:px-4">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <span className="text-lg sm:text-xl font-bold text-gray-900">TANAM</span>
          </Link>

          {/* Navigation Menu */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6 xl:space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors duration-200">
              Home
            </Link>
            <Link href="/#features" className="text-gray-700 hover:text-green-600 transition-colors duration-200">
              Fitur
            </Link>
            <Link href="/pricing" className="text-gray-700 hover:text-green-600 transition-colors duration-200">
              Pricing
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-green-600 transition-colors duration-200">
              Kontak
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
            <Link href="/signin">
              <Button variant="ghost" className="text-gray-700 hover:text-gray-900 text-xs sm:text-sm md:text-base px-2 sm:px-3 md:px-4">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-green-600 hover:bg-green-700 text-white px-2 sm:px-3 md:px-6 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm md:text-base">
                Mulai Sekarang
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="p-2 text-gray-700 hover:text-gray-900">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}