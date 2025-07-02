"use client"

import { useState, useEffect } from "react"
import type { Post, Comment } from "@/lib/db"
import { formatDistanceToNow } from "date-fns"
import CommentSection from "./CommentSection"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw, AlertCircle, Clock, FileText, Heart, Eye } from 'lucide-react'
import Link from "next/link"
import { countWords, estimateReadingTime } from "@/lib/utils"

interface PostPageClientProps {
  postId: number
  initialPost: Post | null
  initialComments: Comment[]
}

export default function PostPageClient({ postId, initialPost, initialComments }: PostPageClientProps) {
  const [post, setPost] = useState<Post | null>(initialPost)
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [loading, setLoading] = useState(!initialPost)
  const [error, setError] = useState<string | null>(null)
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [viewsCount, setViewsCount] = useState(0)
  const [likeLoading, setLikeLoading] = useState(false)

  const fetchPost = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("Client: Fetching post with ID:", postId)

      const response = await fetch(`/api/posts/${postId}`)

      if (response.status === 404) {
        setError("Post not found")
        return
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const postData = await response.json()
      console.log("Client: Received post data:", postData)
      setPost(postData)
      setLikesCount(postData.likes_count || 0)
      setViewsCount(postData.views_count || 0)

      // Also fetch comments
      const commentsResponse = await fetch(`/api/posts/${postId}/comments`)
      if (commentsResponse.ok) {
        const commentsData = await commentsResponse.json()
        setComments(commentsData)
      }
    } catch (err) {
      console.error("Client: Error fetching post:", err)
      setError(err instanceof Error ? err.message : "Failed to load post")
    } finally {
      setLoading(false)
    }
  }

  const fetchLikeStatus = async () => {
    try {
      console.log("Fetching like status for post:", postId)
      const response = await fetch(`/api/posts/${postId}/like`)
      if (response.ok) {
        const data = await response.json()
        console.log("Like status received:", data)
        setLiked(data.liked)
        setLikesCount(data.likes_count)
      } else {
        console.error("Failed to fetch like status:", response.status)
      }
    } catch (error) {
      console.error("Error fetching like status:", error)
    }
  }

  const recordView = async () => {
    try {
      console.log("Recording view for post:", postId)
      const response = await fetch(`/api/posts/${postId}/view`, {
        method: "POST",
      })
      if (response.ok) {
        const data = await response.json()
        console.log("View recorded:", data)
        setViewsCount(data.views_count)
      } else {
        console.error("Failed to record view:", response.status)
      }
    } catch (error) {
      console.error("Error recording view:", error)
    }
  }

  const handleLike = async () => {
    if (likeLoading) return

    setLikeLoading(true)
    try {
      const method = liked ? "DELETE" : "POST"
      console.log("Toggling like:", method, "for post:", postId)
      
      const response = await fetch(`/api/posts/${postId}/like`, {
        method,
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Like toggled successfully:", data)
        setLiked(data.liked)
        setLikesCount(data.likes_count)
      } else {
        const errorData = await response.json()
        console.error("Like toggle failed:", errorData)
        if (errorData.error === "Already liked") {
          // Refresh like status
          fetchLikeStatus()
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error)
    } finally {
      setLikeLoading(false)
    }
  }

  useEffect(() => {
    // If we don't have initial post data, fetch it client-side
    if (!initialPost) {
      fetchPost()
    } else {
      setLikesCount(initialPost.likes_count || 0)
      setViewsCount(initialPost.views_count || 0)
    }

    // Always fetch like status and record view
    fetchLikeStatus()
    recordView()
  }, [postId, initialPost])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading post...</p>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error === "Post not found" ? "Post Not Found" : "Failed to Load Post"}
          </h2>
          <p className="text-gray-600 mb-4">
            {error === "Post not found"
              ? "The post you're looking for doesn't exist or may have been removed."
              : error || "Something went wrong while loading the post."}
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/explore">
              <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Explore</span>
              </Button>
            </Link>
            {error !== "Post not found" && (
              <Button onClick={fetchPost} className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4" />
                <span>Try Again</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true })
  const wordCount = countWords(post.content)
  const readingTime = estimateReadingTime(wordCount)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/explore">
          <Button variant="outline" size="sm" className="flex items-center space-x-2 bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            <span>Orqaga</span>
          </Button>
        </Link>
      </div>

      <article className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-8">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">{post.title}</h1>
          <div className="flex flex-wrap items-center text-gray-600 text-sm gap-x-3 gap-y-2">
            <span className="font-medium">{post.author}</span>
            <span className="hidden sm:inline">•</span>
            <time dateTime={post.created_at.toString()}>{timeAgo}</time>
            <span className="hidden sm:inline">•</span>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{readingTime}</span>
            </div>
            <span className="hidden sm:inline">•</span>
            <div className="flex items-center space-x-1">
              <FileText className="h-4 w-4" />
              <span>{wordCount.toLocaleString()} words</span>
            </div>
          </div>
        </header>

        <div className="prose prose-lg max-w-none mb-8">
          {post.content.split("\n").map((paragraph, index) =>
            paragraph.trim() ? (
              <p key={index} className="mb-4 leading-relaxed text-gray-800">
                {paragraph}
              </p>
            ) : (
              <br key={index} />
            ),
          )}
        </div>

        {/* Like and View Section */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-6">
            <Button
              onClick={handleLike}
              disabled={likeLoading}
              variant={liked ? "default" : "outline"}
              size="sm"
              className={`flex items-center space-x-2 ${
                liked
                  ? "bg-red-500 hover:bg-red-600 text-white border-red-500"
                  : "bg-transparent hover:bg-red-50 hover:text-red-600 hover:border-red-300"
              }`}
            >
              <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
              <span>{likesCount}</span>
              <span className="hidden sm:inline">{liked ? "Yoqtirilgan" : "Yoqtirish"}</span>
            </Button>

            <div className="flex items-center space-x-2 text-gray-500">
              <Eye className="h-4 w-4" />
              <span>{viewsCount}</span>
              <span className="hidden sm:inline">ko'rishlar</span>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            <span className="hidden sm:inline">Bu inshoni ulashing</span>
          </div>
        </div>
      </article>

      <CommentSection postId={postId} initialComments={comments} />
    </div>
  )
}
