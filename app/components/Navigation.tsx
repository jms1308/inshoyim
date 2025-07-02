"use client"

import Link from "next/link"
import { PenTool, Menu, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0" onClick={closeMenu}>
            <PenTool className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            <div className="flex flex-col">
              <span className="text-base sm:text-lg md:text-xl font-bold text-gray-900">Inshoyim</span>
              <span className="text-xs text-gray-500 -mt-0.5 hidden sm:block">byJamshid</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                Asosiy
              </Button>
            </Link>
            <Link href="/explore">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                Izlash
              </Button>
            </Link>
            <Link href="/write">
              <Button size="sm" className="ml-2 flex items-center space-x-2">
                <PenTool className="h-4 w-4" />
                <span>Yozish</span>
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <Button onClick={toggleMenu} variant="ghost" size="sm" className="md:hidden p-2" aria-label="Toggle menu">
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-sm">
            <div className="px-3 pt-3 pb-4 space-y-2">
              <Link href="/" onClick={closeMenu}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-600 hover:text-gray-900 h-12 text-base"
                >
                  Asosiy
                </Button>
              </Link>
              <Link href="/explore" onClick={closeMenu}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-600 hover:text-gray-900 h-12 text-base"
                >
                  Izlash
                </Button>
              </Link>
              <div className="pt-2">
                <Link href="/write" onClick={closeMenu}>
                  <Button className="w-full flex items-center justify-center space-x-2 h-12 text-base">
                    <PenTool className="h-5 w-5" />
                    <span>Yozish</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
