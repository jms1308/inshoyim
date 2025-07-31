"use client"

import type React from "react"

import Link from "next/link"
import type { Post } from "@/lib/db"
import { formatDistanceToNow } from "date-fns"
import { Trash2, Eye, User, Clock, Heart, Calendar, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { countWords, estimateReadingTime } from "@/lib/utils"

interface PostCardProps {
  post: Post
  onDelete?: (postId: string) => void
  showDeleteButton?: boolean
  onClick?: (post: Post) => void
}

export default function PostCard({ post, onDelete, showDeleteButton = true, onClick }: PostCardProps) {
  console.log("PostCard post:", post)
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true })
  const wordCount = countWords(post.content)
  const readingTime = estimateReadingTime(wordCount)

  return (
    <article
      className="relative bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300 cursor-pointer"
      tabIndex={0}
      role="button"
      aria-label={`Open post: ${post.title}`}
      onClick={() => onClick && onClick(post)}
      onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && onClick) onClick(post) }}
    >
      <div className="p-4 sm:p-5 md:p-6">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
          {post.title}
        </h2>
        <p className="text-gray-600 mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base line-clamp-3">{post.excerpt}</p>
        {/* Apple value always visible with label */}
        <div className="mb-2">
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-semibold">
            Ko'rishlar soni: {post.apple ? post.apple : '—'}
          </span>
        </div>
        <div className="flex items-start justify-between gap-3 mt-1">
          <div className="flex items-center text-xs sm:text-sm text-gray-500 gap-2 flex-wrap min-w-0 flex-1">
            <div className="flex items-center gap-1 shrink-0">
              <User className="h-3 w-3" />
              <span className="font-medium truncate max-w-20 sm:max-w-none">{post.author}</span>
            </div>
            <span className="text-gray-300 shrink-0 hidden xs:inline">•</span>
            {post.upload_time && (
              <>
                <div className="flex items-center gap-1 shrink-0">
                  <Calendar className="h-3 w-3" />
                  <span className="text-xs">{post.upload_time}</span>
                </div>
                <span className="text-gray-300 shrink-0 hidden xs:inline">•</span>
              </>
            )}
            <div className="flex items-center gap-1 shrink-0">
              <BookOpen className="h-3 w-3" />
              <span className="text-xs">{readingTime}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
