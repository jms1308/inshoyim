"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, FileText, Clock } from "lucide-react"
import { countWords, estimateReadingTime } from "@/lib/utils"

export default function WriteForm() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [author, setAuthor] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const MIN_WORD_COUNT = 150
  const wordCount = countWords(content)
  const isContentValid = wordCount >= MIN_WORD_COUNT
  const remainingWords = MIN_WORD_COUNT - wordCount
  const readingTime = estimateReadingTime(wordCount)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      setError("Sarlavha talab qilinadi")
      return
    }

    if (!content.trim()) {
      setError("Mazmun talab qilinadi")
      return
    }

    if (wordCount < MIN_WORD_COUNT) {
      setError(
        `Insho mazmuni kamida ${MIN_WORD_COUNT} so'zdan iborat bo'lishi kerak. Sizga yana ${remainingWords} ta so'z${remainingWords === 1 ? "" : ""} kerak.`,
      )
      return
    }

    setIsSubmitting(true)
    setError("")
    setSuccess(false)

    try {
      console.log("Submitting post:", {
        title: title.substring(0, 50),
        author,
        wordCount,
        characterCount: content.length,
      })

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          author: author.trim() || "Anonim",
        }),
      })

      const responseData = await response.json()
      console.log("Response:", responseData)

      if (response.ok) {
        setSuccess(true)
        console.log("Post created successfully, redirecting to:", `/post/${responseData.id}`)

        // Small delay to show success message
        setTimeout(() => {
          router.push(`/post/${responseData.id}`)
        }, 1500)
      } else {
        setError(responseData.error || "Inshoni nashr qilishda xatolik yuz berdi")
      }
    } catch (error) {
      console.error("Network error:", error)
      setError("Tarmoq xatosi. Internetga ulanishni tekshiring va qayta urinib ko'ring.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
        <div className="text-center">
          <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Insho Muvaffaqiyatli Nashr Qilindi!</h2>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">Sizni inshoyingizga yo'naltirmoqdamiz...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span className="text-sm sm:text-base">{error}</span>
          </div>
        )}

        <div>
          <label htmlFor="author" className="block text-sm font-semibold text-gray-700 mb-2">
            Muallif Ismi (ixtiyoriy)
          </label>
          <input
            type="text"
            id="author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Ismingizni kiriting yoki Anonim uchun bo'sh qoldiring"
            className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
            Insho Sarlavhasi *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Insho sarlavhasini kiriting..."
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-lg sm:text-xl font-semibold"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="content" className="block text-sm font-semibold text-gray-700">
              Insho Mazmuni *
            </label>
            <div className="flex items-center space-x-4 text-xs sm:text-sm">
              <div className="flex items-center space-x-1">
                <FileText className="h-4 w-4 text-gray-400" />
                <span
                  className={`font-medium ${
                    isContentValid ? "text-green-600" : remainingWords > 50 ? "text-red-500" : "text-orange-500"
                  }`}
                >
                  {wordCount} / {MIN_WORD_COUNT} so'z
                </span>
              </div>
              {wordCount > 0 && (
                <div className="flex items-center space-x-1 text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>{readingTime}</span>
                </div>
              )}
            </div>
          </div>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="O'z fikrlaringiz, tajribalaringiz va tushunchalaringizni ulashing. Mazmunli insho yaratish uchun kamida 150 so'z yozing..."
            required
            rows={18}
            className={`w-full px-4 py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none leading-relaxed ${
              isContentValid
                ? "border-green-300 focus:border-green-500"
                : wordCount > 0
                  ? "border-orange-300 focus:border-orange-500"
                  : "border-gray-300 focus:border-blue-500"
            }`}
            disabled={isSubmitting}
          />
          <div className="flex items-center justify-between mt-2">
            <div className="text-xs sm:text-sm">
              {!isContentValid && remainingWords > 0 && (
                <span className="text-orange-600 font-medium">Yana {remainingWords} ta so'z kerak</span>
              )}
              {isContentValid && (
                <span className="text-green-600 font-medium flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Minimal so'z soni yetkazildi
                </span>
              )}
            </div>
            <div className="text-xs sm:text-sm text-gray-400 text-right">
              <div>{content.length.toLocaleString()} belgi</div>
              {wordCount > 0 && <div className="text-xs">{readingTime}</div>}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={isSubmitting || !title.trim() || !isContentValid}
            size="lg"
            className="w-full sm:w-auto min-w-[160px]"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Nashr qilinmoqda...</span>
              </div>
            ) : (
              "Inshoni Nashr Qilish"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
