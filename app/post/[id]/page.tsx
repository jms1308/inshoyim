import { sql } from "@/lib/db"
import type { Post, Comment } from "@/lib/db"
import { notFound } from "next/navigation"
import PostPageClient from "./PostPageClient"

async function getPost(id: number): Promise<Post | null> {
  try {
    console.log("Server: Fetching post with ID:", id)
    const posts = await sql`
      SELECT id, title, content, author, excerpt, created_at, updated_at 
      FROM posts 
      WHERE id = ${id}
    `
    console.log("Server: Found posts:", posts.length)
    return (posts[0] as Post) || null
  } catch (error) {
    console.error("Server: Error fetching post:", error)
    return null
  }
}

async function getComments(postId: number): Promise<Comment[]> {
  try {
    const comments = await sql`
      SELECT id, post_id, content, author, created_at 
      FROM comments 
      WHERE post_id = ${postId}
      ORDER BY created_at ASC
    `
    return comments as Comment[]
  } catch (error) {
    console.error("Server: Error fetching comments:", error)
    return []
  }
}

export default async function PostPage({ params }: { params: { id: string } }) {
  const postId = Number.parseInt(params.id)

  if (isNaN(postId)) {
    console.log("Server: Invalid post ID:", params.id)
    notFound()
  }

  // Try to get the post server-side first
  const [post, comments] = await Promise.all([getPost(postId), getComments(postId)])

  // If we can't find the post server-side (common in preview mode),
  // let the client component handle it
  return <PostPageClient postId={postId} initialPost={post} initialComments={comments} />
}
