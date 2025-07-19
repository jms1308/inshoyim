"use client"

import type React from "react"

import Link from "next/link"
import type { Post } from "@/lib/db"
import { formatDistanceToNow } from "date-fns"
import { Trash2, Eye, User, Clock, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { countWords, estimateReadingTime } from "@/lib/utils"

interface PostCardProps {
  post: Post
  onDelete?: (postId: number) => void
  showDeleteButton?: boolean
}

export default function PostCard({ post, onDelete, showDeleteButton = true }: PostCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true })
  const wordCount = countWords(post.content)
  const readingTime = estimateReadingTime(wordCount)

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation to post
    e.stopPropagation()

    const confirmationCode = prompt(`"${post.title}" inshosini o'chirish uchun 'delete7' so'zini kiriting:`)

    if (confirmationCode !== "delete7") {
      if (confirmationCode !== null) {
        // User didn't cancel
        alert("Noto'g'ri kod kiritildi. Insho o'chirilmadi.")
      }
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        if (onDelete) {
          onDelete(post.id)
        }
      } else {
        const errorData = await response.json()
        alert(`Inshoni o'chirishda xatolik: ${errorData.error || "Noma'lum xatolik"}`)
      }
    } catch (error) {
      console.error("Error deleting post:", error)
      alert("Tarmoq xatosi. Qayta urinib ko'ring.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300">
      <div className="p-4 sm:p-5 md:p-6">
        <Link href={`/post/${post.id}`} className="block group">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
            {post.title}
          </h2>
          <p className="text-gray-600 mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base line-clamp-3">{post.excerpt}</p>
        </Link>

        <div className="flex items-start justify-between gap-3 mt-1">
          <div className="flex items-center text-xs sm:text-sm text-gray-500 gap-2 flex-wrap min-w-0 flex-1">
            <div className="flex items-center gap-1 shrink-0">
              <User className="h-3 w-3" />
              <span className="font-medium truncate max-w-20 sm:max-w-none">{post.author}</span>
            </div>
            <span className="text-gray-300 shrink-0">•</span>
            <time dateTime={post.created_at.toString()} className="shrink-0 text-xs">
              {timeAgo}
            </time>
            <span className="text-gray-300 shrink-0 hidden xs:inline">•</span>
            <div className="flex items-center gap-1 shrink-0">
              <Clock className="h-3 w-3" />
              <span className="text-xs">{readingTime}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Stats */}
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                <span>{post.likes_count || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{post.views_count || 0}</span>
              </div>
            </div>

            <Link href={`/post/${post.id}`}>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs bg-transparent border-gray-200 hover:border-blue-300 hover:text-blue-600"
              >
                <Eye className="h-3 w-3 mr-1" />
                <span className="hidden xs:inline">O'qish</span>
                <span className="xs:hidden">Read</span>
              </Button>
            </Link>

            {showDeleteButton && (
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                variant="destructive"
                size="sm"
                className="h-8 px-3 text-xs"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                <span className="hidden xs:inline">{isDeleting ? "O'chirilmoqda..." : "O'chirish"}</span>
                <span className="xs:hidden">{isDeleting ? "..." : "Del"}</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
