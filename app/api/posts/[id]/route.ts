import { sql } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const postId = Number.parseInt(params.id)

    console.log("API: Fetching individual post with ID:", postId)

    if (isNaN(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 })
    }

    const posts = await sql`
      SELECT id, title, content, author, excerpt, created_at, updated_at 
      FROM posts 
      WHERE id = ${postId}
    `

    console.log("API: Found posts for ID", postId, ":", posts.length)

    if (posts.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Ensure structured-clone-safe response
    const row = posts[0]
    const post = {
      id: Number(row.id),
      title: row.title,
      content: row.content,
      author: row.author,
      excerpt: row.excerpt,
      created_at: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
      updated_at: row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at),
    }

    console.log("API: Returning post:", { id: post.id, title: post.title.substring(0, 50) })

    return NextResponse.json(post)
  } catch (error) {
    console.error("API: Error fetching post:", error)
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const postId = Number.parseInt(params.id)

    console.log("API: Deleting post with ID:", postId)

    if (isNaN(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 })
    }

    // First check if post exists
    const existingPosts = await sql`
      SELECT id FROM posts WHERE id = ${postId}
    `

    if (existingPosts.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Delete comments first (foreign key constraint)
    await sql`DELETE FROM comments WHERE post_id = ${postId}`

    // Then delete the post
    const result = await sql`
      DELETE FROM posts WHERE id = ${postId}
      RETURNING id
    `

    console.log("API: Successfully deleted post:", postId)

    return NextResponse.json({
      success: true,
      message: "Post deleted successfully",
      deletedId: postId,
    })
  } catch (error) {
    console.error("API: Error deleting post:", error)
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 })
  }
}
