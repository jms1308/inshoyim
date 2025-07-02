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
          <div className="text-center p-4 sm:p-6 bg-white rounded-lg shadow-sm">
            <PenTool className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Erkin Yozing</h3>
            <p className="text-sm sm:text-base text-gray-600">
              Uzun matnlar uchun mo'ljallangan toza, chalg'ituvchi elementlarsiz yozish interfeysi
            </p>
          </div>
          <div className="text-center p-4 sm:p-6 bg-white rounded-lg shadow-sm">
            <Users className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Bog'laning</h3>
            <p className="text-sm sm:text-base text-gray-600">
              Izohlar va muhokamalar orqali boshqa yozuvchilar va o'quvchilar bilan muloqot qiling
            </p>
          </div>
          <div className="text-center p-4 sm:p-6 bg-white rounded-lg shadow-sm sm:col-span-2 md:col-span-1">
            <Zap className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Kashf Eting</h3>
            <p className="text-sm sm:text-base text-gray-600">
              Dunyo bo'ylab yozuvchilarning ajoyib hikoyalari va insholarini toping
            </p>
          </div>
        </div>
      </div>

      {/* Latest Essays Carousel */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center sm:text-left">
            Eng So'nggi Insholar
          </h2>
          <Link href="/explore">
            <Button variant="outline" className="bg-transparent w-full sm:w-auto min-h-[44px]">
              Barchasini Ko'rish
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Insholar yuklanmoqda...</p>
          </div>
        ) : latestPosts.length > 0 ? (
          <div className="relative">
            <div className="overflow-hidden rounded-xl">
              <div
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {latestPosts.map((post) => {
                  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true })
                  const wordCount = countWords(post.content)
                  const readingTime = estimateReadingTime(wordCount)

                  return (
                    <div key={post.id} className="w-full flex-shrink-0">
                      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mx-2">
                        <Link href={`/post/${post.id}`} className="block group">
                          <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">{post.excerpt}</p>
                        </Link>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-500 space-x-2">
                            <div className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span className="font-medium">{post.author}</span>
                            </div>
                            <span>•</span>
                            <time dateTime={post.created_at.toString()}>{timeAgo}</time>
                            <span>•</span>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{readingTime}</span>
                            </div>
                          </div>

                          <Link href={`/post/${post.id}`}>
                            <Button variant="outline" size="sm" className="flex items-center space-x-1 bg-transparent">
                              <Eye className="h-4 w-4" />
                              <span>O'qish</span>
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {latestPosts.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow border border-gray-200"
                >
                  <ChevronLeft className="h-6 w-6 text-gray-600" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow border border-gray-200"
                >
                  <ChevronRight className="h-6 w-6 text-gray-600" />
                </button>

                <div className="flex justify-center mt-4 sm:mt-6 px-4">
                  <div className="flex items-center gap-2 sm:gap-3 bg-white/80 backdrop-blur-sm rounded-full px-3 py-2 shadow-sm border border-gray-200">
                    {latestPosts.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`relative transition-all duration-200 touch-manipulation ${
                          index === currentSlide
                            ? "w-6 h-3 bg-blue-600 rounded-full"
                            : "w-3 h-3 bg-gray-300 hover:bg-gray-400 rounded-full active:scale-95"
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      >
                        <span className="sr-only">Slide {index + 1}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500 text-lg">Hali insholar mavjud emas. Birinchi bo'lib yozing!</p>
            <Link href="/write" className="mt-4 inline-block">
              <Button>
                <PenTool className="mr-2 h-4 w-4" />
                Yozishni Boshlash
              </Button>
            </Link>
          </div>
        )}
      </div>

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
