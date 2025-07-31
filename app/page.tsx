"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PenTool, BookOpen, Users, Zap } from "lucide-react"
import { useState, useEffect } from "react"
// import type { Post } from "@/lib/db" // Bu qator olib tashlandi

export default function HomePage() {
  const [latestPosts, setLatestPosts] = useState<any[]>([]) // `Post` o'rniga `any` ishlatildi, chunki `Post` tipi endi import qilinmaydi
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

  return (
    <div className="min-h-screen font-sans" style={{ 
      background: "linear-gradient(135deg, #f0f7ff 0%, #e6f0fd 100%)",
      fontFamily: "'Inter', 'Poppins', 'Helvetica Neue', sans-serif"
    }}>
      {/* Minimal Header Banner with Abstract Pattern */}
      <div className="relative h-40 overflow-hidden" style={{
        background: "linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)"
      }}>
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 0 10 L 40 10 M 10 0 L 10 40 M 0 20 L 40 20 M 20 0 L 20 40 M 0 30 L 40 30 M 30 0 L 30 40" 
                  fill="none" stroke="#fff" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <h2 className="text-white text-3xl font-light tracking-wide">Inshoyim</h2>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 mb-6 leading-tight">
          O'z <span className="text-blue-600 font-normal ">Xulosalaringizni</span> Ulashing
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed font-light">
          Inshoyim - yozuvchilar uzun matnlarni ulashish, o'quvchilar bilan bog'lanish va mazmunli hikoyalar atrofida
          jamiyat qurish uchun zamonaviy platforma.
        </p>
        <div className="flex flex-col sm:flex-row gap-5 justify-center">
          <Link href="/explore">
            <Button size="lg" className="w-full sm:w-auto px-8 py-3 text-base min-h-[48px] rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-blue-600 hover:bg-blue-700 text-white">
              <BookOpen className="mr-2 h-5 w-5" />
              Insholarni Ko'rish
            </Button>
          </Link>
          <Link href="/write">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto px-8 py-3 text-base bg-transparent min-h-[48px] rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-blue-500 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <PenTool className="mr-2 h-5 w-5" />
              Yozishni Boshlash
            </Button>
          </Link>
        </div>
      </div>

      {/* Thin Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent opacity-70"></div>
      </div>

      {/* Features Section */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Erkin Yozing */}
          <div className="group text-center p-8 bg-white bg-opacity-50 rounded-xl shadow-sm hover:shadow-md transition-all duration-500 hover:bg-white hover:bg-opacity-80 backdrop-blur-sm animate-fade-in">
            <div className="flex justify-center mb-6">
              <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform duration-300">
                <PenTool className="h-6 w-6" />
              </span>
            </div>
            <h3 className="text-xl font-normal mb-3 text-gray-800">Erkin Yozing</h3>
            <p className="text-base text-gray-600 font-light">Uzun matnlar uchun mo'ljallangan toza, chalg'ituvchi elementlarsiz yozish interfeysi</p>
          </div>
          
          {/* Bog'laning */}
          <div className="group text-center p-8 bg-white bg-opacity-50 rounded-xl shadow-sm hover:shadow-md transition-all duration-500 hover:bg-white hover:bg-opacity-80 backdrop-blur-sm animate-fade-in delay-100">
            <div className="flex justify-center mb-6">
              <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-6 w-6" />
              </span>
            </div>
            <h3 className="text-xl font-normal mb-3 text-gray-800">Bog'laning</h3>
            <p className="text-base text-gray-600 font-light">Izohlar va muhokamalar orqali boshqa yozuvchilar va o'quvchilar bilan muloqot qiling</p>
          </div>
          
          {/* Kashf Eting */}
          <div className="group text-center p-8 bg-white bg-opacity-50 rounded-xl shadow-sm hover:shadow-md transition-all duration-500 hover:bg-white hover:bg-opacity-80 backdrop-blur-sm animate-fade-in delay-200">
            <div className="flex justify-center mb-6">
              <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-6 w-6" />
              </span>
            </div>
            <h3 className="text-xl font-normal mb-3 text-gray-800">Kashf Eting</h3>
            <p className="text-base text-gray-600 font-light">Dunyo bo'ylab yozuvchilarning ajoyib hikoyalari va insholarini toping</p>
          </div>
        </div>
      </div>

      {/* Thin Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent opacity-70"></div>
      </div>

      {/* CTA Section */}
      <div className="py-16" style={{
        background: "linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)"
      }}>
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-light text-white mb-4 leading-tight">
            O'z Xulosalaringizni Ulashishga Tayyormisiz?
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto font-light opacity-90">
            Yozuvchilar va o'quvchilar jamiyatiga qo'shiling. Hech qanday ro'yxatdan o'tish talab qilinmaydi - shunchaki
            yozishni boshlang.
          </p>
          <Link href="/write">
            <Button
              size="lg"
              className="px-8 py-3 text-base min-h-[48px] rounded-full bg-white text-blue-600 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:bg-gray-50"
            >
              Hoziroq Yozishni Boshlash
            </Button>
          </Link>
        </div>
      </div>

      {/* Add animation keyframes */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        
        .delay-100 {
          animation-delay: 0.1s;
        }
        
        .delay-200 {
          animation-delay: 0.2s;
        }
        
        /* Typing animation - improved version */
        .typing-text {
          position: relative;
          width: max-content;
          margin: 0 auto;
        }
        
        .typing-text::before {
          content: "Xulosalaringizni";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          color: transparent;
          overflow: hidden;
          border-right: 3px solid #3b82f6;
          white-space: nowrap;
          animation: typing 3s steps(16) infinite;
        }
        
        .typing-text::after {
          content: "";
          position: absolute;
          top: 0;
          right: -3px;
          width: 3px;
          height: 100%;
          background-color: #3b82f6;
          animation: blink 0.7s infinite;
        }
        
        @keyframes typing {
          0% { width: 0; }
          70% { width: 100%; }
          90%, 100% { width: 100%; }
        }
        
        @keyframes blink {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
