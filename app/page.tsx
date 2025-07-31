"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PenTool, BookOpen, Users, Zap, ChevronLeft, ChevronRight, Eye, User, Clock } from "lucide-react"
import { useState, useEffect } from "react"
import type { Post } from "@/lib/db"
import { formatDistanceToNow } from "date-fns"
import { countWords, estimateReadingTime } from "@/lib/utils"

export default function HomePage() {
  const [latestPosts, setLatestPosts] = useState<Post[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLatestPosts = async () => {
      try {
        const response = await fetch("/api/posts?limit=6")
        if (response.ok) {
          const data = await response.json()
          setLatestPosts(data.posts || [])
        }
      } catch (error) {
        console.error("Error fetching latest posts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLatestPosts()
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.max(1, latestPosts.length))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + latestPosts.length) % Math.max(1, latestPosts.length))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-6 sm:pb-8">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            O'z <span className="text-blue-600">Xulosalaringizni</span> Ulashing
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed px-2">
            Inshoyim - yozuvchilar uzun matnlarni ulashish, o'quvchilar bilan bog'lanish va mazmunli hikoyalar atrofida
            jamiyat qurish uchun zamonaviy platforma.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link href="/explore">
              <Button size="lg" className="w-full sm:w-auto px-6 sm:px-8 py-3 text-base sm:text-lg min-h-[48px]">
                <BookOpen className="mr-2 h-5 w-5" />
                Insholarni Ko'rish
              </Button>
            </Link>
            <Link href="/write">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto px-6 sm:px-8 py-3 text-base sm:text-lg bg-transparent min-h-[48px]"
              >
                <PenTool className="mr-2 h-5 w-5" />
                Yozishni Boshlash
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Erkin Yozing */}
          <div className="group text-center p-6 bg-white/60 dark:bg-gray-900/60 rounded-2xl shadow-xl border border-blue-100 dark:border-gray-800 backdrop-blur-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-100">
            <div className="flex justify-center mb-4">
              <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white border-4 border-blue-100 shadow-lg group-hover:scale-110 transition-transform">
                <PenTool className="h-8 w-8 text-blue-500" />
              </span>
            </div>
            <h3 className="text-xl font-bold mb-2 text-blue-700 group-hover:text-purple-600 transition-colors">Erkin Yozing</h3>
            <p className="text-base text-gray-600 dark:text-gray-300">Uzun matnlar uchun mo'ljallangan toza, chalg'ituvchi elementlarsiz yozish interfeysi</p>
          </div>
          {/* Bog'laning */}
          <div className="group text-center p-6 bg-white/60 dark:bg-gray-900/60 rounded-2xl shadow-xl border border-blue-100 dark:border-gray-800 backdrop-blur-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-100">
            <div className="flex justify-center mb-4">
              <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white border-4 border-blue-100 shadow-lg group-hover:scale-110 transition-transform">
                <Users className="h-8 w-8 text-blue-500" />
              </span>
            </div>
            <h3 className="text-xl font-bold mb-2 text-blue-700 group-hover:text-purple-600 transition-colors">Bog'laning</h3>
            <p className="text-base text-gray-600 dark:text-gray-300">Izohlar va muhokamalar orqali boshqa yozuvchilar va o'quvchilar bilan muloqot qiling</p>
          </div>
          {/* Kashf Eting */}
          <div className="group text-center p-6 bg-white/60 dark:bg-gray-900/60 rounded-2xl shadow-xl border border-blue-100 dark:border-gray-800 backdrop-blur-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-100 sm:col-span-2 md:col-span-1">
            <div className="flex justify-center mb-4">
              <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white border-4 border-blue-100 shadow-lg group-hover:scale-110 transition-transform">
                <Zap className="h-8 w-8 text-blue-500" />
              </span>
            </div>
            <h3 className="text-xl font-bold mb-2 text-blue-700 group-hover:text-purple-600 transition-colors">Kashf Eting</h3>
            <p className="text-base text-gray-600 dark:text-gray-300">Dunyo bo'ylab yozuvchilarning ajoyib hikoyalari va insholarini toping</p>
          </div>
        </div>
      </div>
      {/* Removed Eng So'nggi Insholar section */}

      {/* CTA Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
            O'z Xulosalaringizni Ulashishga Tayyormisiz?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            Yozuvchilar va o'quvchilar jamiyatiga qo'shiling. Hech qanday ro'yxatdan o'tish talab qilinmaydi - shunchaki
            yozishni boshlang.
          </p>
          <Link href="/write">
            <Button
              size="lg"
              className="w-full sm:w-auto px-6 sm:px-8 py-3 text-base sm:text-lg min-h-[48px] max-w-sm mx-auto"
            >
              Hoziroq Yozishni Boshlash
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
