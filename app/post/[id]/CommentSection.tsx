"use client"

import type React from "react"

import { useState } from "react"
import type { Comment } from "@/lib/db"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface CommentSectionProps {
  postId: number
  initialComments: Comment[]
}

export default function CommentSection({ postId, initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState("")
  const [author, setAuthor] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newComment.trim()) {
      setError("Comment cannot be empty")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newComment.trim(),
          author: author.trim() || "Anonymous",
        }),
      })

      if (response.ok) {
        const comment = await response.json()
        setComments([...comments, comment])
        setNewComment("")
        setAuthor("")
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to post comment")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    const confirmationCode = prompt("Izohni o'chirish uchun 'delete7' so'zini kiriting:")

    if (confirmationCode !== "delete7") {
      if (confirmationCode !== null) {
        alert("Noto'g'ri kod kiritildi. Izoh o'chirilmadi.")
      }
      return
    }

    try {
      const response = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setComments(comments.filter((comment) => comment.id !== commentId))
      } else {
        const errorData = await response.json()
        alert(`Izohni o'chirishda xatolik: ${errorData.error || "Noma'lum xatolik"}`)
      }
    } catch (error) {
      console.error("Error deleting comment:", error)
      alert("Tarmoq xatosi. Qayta urinib ko'ring.")
    }
  }

  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Comments ({comments.length})</h2>

      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>}

        <div>
          <label htmlFor="comment-author" className="block text-sm font-medium text-gray-700 mb-2">
            Name (optional)
          </label>
          <input
            type="text"
            id="comment-author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Your name or leave blank for Anonymous"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        <div>
          <label htmlFor="comment-content" className="block text-sm font-medium text-gray-700 mb-2">
            Comment
          </label>
          <textarea
            id="comment-content"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
          />
        </div>

        <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
          {isSubmitting ? "Posting..." : "Post Comment"}
        </Button>
      </form>

      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No comments yet. Be the first to share your thoughts!</p>
        ) : (
          comments.map((comment) => {
            const timeAgo = formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })

            return (
              <div key={comment.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-gray-900">{comment.author}</span>
                  <div className="flex items-center space-x-2">
                    <time className="text-sm text-gray-500" dateTime={comment.created_at}>
                      {timeAgo}
                    </time>
                    <Button
                      onClick={() => handleDeleteComment(comment.id)}
                      variant="destructive"
                      size="sm"
                      className="flex items-center space-x-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span className="hidden sm:inline">O'chirish</span>
                    </Button>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">{comment.content}</p>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}
