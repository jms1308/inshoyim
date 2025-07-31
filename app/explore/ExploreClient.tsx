"use client"

import { useState, useEffect } from "react"
// Function to increment Apple value in Google Sheet
async function sendEssay(post: Post) {
  // Use localStorage to track if this user has already viewed this essay
  if (typeof window !== 'undefined') {
    const viewedKey = `viewed_apple_${post.id}`;
    if (localStorage.getItem(viewedKey)) {
      // Already viewed, do not increment again
      return;
    }
    localStorage.setItem(viewedKey, '1');
  }
  const url = "https://script.google.com/macros/s/AKfycbx2E7MuP7ZS2wdB0Q5hRgq6VthLgkLS_rM5ExgFk5Q31-DUTgx6Pf1gjzunRnoJELG8/exec";
  const formData = new URLSearchParams();
  formData.append("action", "incrementView");
  formData.append("name", post.title || "");
  formData.append("by", post.author || "");
  formData.append("text", post.content || "");
  try {
    await fetch(url, {
      method: "POST",
      body: formData,
    });
  } catch (e) {
    // Optionally handle error
    console.error("Failed to increment Apple value:", e);
  }
}
import type { Post } from "@/lib/db"
import PostCard from "../components/PostCard"
import SearchBar from "../components/SearchBar"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertCircle } from "lucide-react"
import PostPageClient from "../post/[id]/PostPageClient"

interface PostsResponse {
  posts: Post[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export default function ExploreClient() {
  const [postsData, setPostsData] = useState<PostsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)

  const fetchPosts = async (page = 1, search = "") => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      })

      if (search.trim()) {
        params.set("search", search.trim())
      }


      const response = await fetch(`/api/posts?${params}`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data: PostsResponse = await response.json()


      setPostsData(data)
      setCurrentPage(page)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Insholarni yuklashda xatolik yuz berdi")
    } finally {
      setLoading(false)
    }
  }

  const handlePostDelete = (deletedPostId: string) => {
    if (postsData) {
      const updatedPosts = postsData.posts.filter((post) => post.id !== deletedPostId)
      setPostsData({
        ...postsData,
        posts: updatedPosts,
        pagination: {
          ...postsData.pagination,
          total: postsData.pagination.total - 1,
        },
      })
    }
  }

  useEffect(() => {
    fetchPosts(1, searchQuery)
  }, [searchQuery])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handlePageChange = (newPage: number) => {
    fetchPosts(newPage, searchQuery)
  }

  const handleRefresh = () => {
    fetchPosts(currentPage, searchQuery)
  }

  if (loading && !postsData) {
    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Insholar yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="text-center">
          <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Insholarni Yuklashda Xatolik</h2>
          <p className="text-gray-600 mb-4 text-sm sm:text-base px-4">{error}</p>
          <Button onClick={handleRefresh} className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Qayta Urinish</span>
          </Button>
        </div>
      </div>
    )
  }

  const posts = postsData?.posts || []
  const pagination = postsData?.pagination


  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      <div className="text-center mb-6 sm:mb-8 md:mb-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600 mb-2 sm:mb-3 md:mb-4 leading-tight">
          Insholarni Kashf Eting
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-2 sm:px-4">
          Dunyo bo'ylab yozuvchilarning ajoyib insholar va hikoyalarini kashf eting
        </p>
      </div>

      <div className="mb-4 sm:mb-6 md:mb-8">
        <SearchBar onSearch={handleSearch} initialValue={searchQuery} placeholder="Insholarni qidirish..." />
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 md:mb-6 space-y-2 sm:space-y-0">
        <div className="text-xs sm:text-sm text-gray-600 px-1 text-center sm:text-left">
          {pagination && (
            <>
              {pagination.total} insholardan {posts.length} tasi ko'rsatilmoqda
              {searchQuery && (
                <>
                  <br className="sm:hidden" />
                  <span className="sm:ml-1">"{searchQuery}" uchun</span>
                </>
              )}
            </>
          )}
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2 self-center sm:self-auto bg-transparent min-h-[40px]"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          <span>Yangilash</span>
        </Button>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <p className="text-gray-500 text-base sm:text-lg px-4">
            {searchQuery
              ? `"${searchQuery}" uchun insholar topilmadi`
              : "Hali insholar mavjud emas. Birinchi bo'lib yozing!"}
          </p>
          {!searchQuery && (
            <div className="mt-4">
              <Button onClick={handleRefresh} variant="outline" className="bg-transparent">
                <RefreshCw className="h-4 w-4 mr-2" />
                Qayta Yuklash
              </Button>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
            {posts.map((post, index) => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={handlePostDelete}
                showDeleteButton={true}
                onClick={async () => {
                  setSelectedPost(post);
                  // Send Apple increment after modal is open
                  setTimeout(() => { sendEssay(post); }, 100);
                }}
              />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.hasPrev || loading}
                variant="outline"
                size="sm"
                className="w-full sm:w-auto min-h-[44px]"
              >
                Oldingi
              </Button>

              <span className="text-xs sm:text-sm text-gray-600 order-first sm:order-none px-3 sm:px-4 py-2 bg-gray-50 rounded-lg border text-center">
                {pagination.totalPages} dan {pagination.page} sahifa
              </span>

              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasNext || loading}
                variant="outline"
                size="sm"
                className="w-full sm:w-auto min-h-[44px]"
              >
                Keyingi
              </Button>
            </div>
          )}
        </>
      )}
      {/* Modal overlay for full essay */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          {/* Mobile full-screen modal */}
          <div className="bg-white w-full h-full max-w-none max-h-none rounded-none p-0 sm:rounded-lg sm:max-w-2xl sm:max-h-[90vh] sm:p-6 relative overflow-y-auto flex flex-col">
            {/* Desktop close button */}
            <button
              className="hidden sm:block absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl font-bold"
              onClick={() => setSelectedPost(null)}
              aria-label="Close"
            >
              &times;
            </button>
            <div className="flex-1 overflow-y-auto p-4 sm:p-0">
              <PostPageClient postId={selectedPost.id} initialPost={selectedPost} initialComments={[]} onBack={() => setSelectedPost(null)} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
