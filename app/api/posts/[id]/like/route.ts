import { sql } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const realIP = request.headers.get("x-real-ip")

  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }

  if (realIP) {
    return realIP
  }

  return "127.0.0.1" // fallback for development
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const postId = Number.parseInt(params.id)

    if (isNaN(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 })
    }

    const userIP = getClientIP(request)
    const userAgent = request.headers.get("user-agent") || ""

    console.log("Like POST: postId =", postId, "userIP =", userIP)

    // Check if user already liked this post
    const existingLike = await sql`
      SELECT * FROM post_likes 
      WHERE post_id = ${postId} AND user_ip = ${userIP}
    `

    console.log("Existing likes found:", existingLike.length)

    if (existingLike.length > 0) {
      return NextResponse.json({ error: "Already liked" }, { status: 400 })
    }

    // Add like
    const insertResult = await sql`
      INSERT INTO post_likes (post_id, user_ip, user_agent)
      VALUES (${postId}, ${userIP}, ${userAgent})
      RETURNING id
    `

    console.log("Like inserted:", insertResult.length > 0)

    // Update post likes count
    await sql`
      UPDATE posts 
      SET likes_count = COALESCE(likes_count, 0) + 1 
      WHERE id = ${postId}
    `

    // Get updated post data
    const posts = await sql`
      SELECT likes_count FROM posts WHERE id = ${postId}
    `

    const likesCount = posts[0]?.likes_count || 0
    console.log("Updated likes count:", likesCount)

    return NextResponse.json({
      success: true,
      likes_count: Number(likesCount),
      liked: true,
    })
  } catch (error) {
    console.error("Error adding like:", error)
    return NextResponse.json({ error: "Failed to add like" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const postId = Number.parseInt(params.id)

    if (isNaN(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 })
    }

    const userIP = getClientIP(request)
    console.log("Like DELETE: postId =", postId, "userIP =", userIP)

    // Remove like
    const result = await sql`
      DELETE FROM post_likes 
      WHERE post_id = ${postId} AND user_ip = ${userIP}
      RETURNING id
    `

    console.log("Likes deleted:", result.length)

    if (result.length === 0) {
      return NextResponse.json({ error: "Like not found" }, { status: 404 })
    }

    // Update post likes count
    await sql`
      UPDATE posts 
      SET likes_count = GREATEST(0, COALESCE(likes_count, 0) - 1) 
      WHERE id = ${postId}
    `

    // Get updated post data
    const posts = await sql`
      SELECT likes_count FROM posts WHERE id = ${postId}
    `

    const likesCount = posts[0]?.likes_count || 0
    console.log("Updated likes count after delete:", likesCount)

    return NextResponse.json({
      success: true,
      likes_count: Number(likesCount),
      liked: false,
    })
  } catch (error) {
    console.error("Error removing like:", error)
    return NextResponse.json({ error: "Failed to remove like" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const postId = Number.parseInt(params.id)

    if (isNaN(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 })
    }

    const userIP = getClientIP(request)
    console.log("Like GET: postId =", postId, "userIP =", userIP)

    // Check if user liked this post
    const existingLike = await sql`
      SELECT * FROM post_likes 
      WHERE post_id = ${postId} AND user_ip = ${userIP}
    `

    // Get post likes count
    const posts = await sql`
      SELECT likes_count FROM posts WHERE id = ${postId}
    `

    const likesCount = posts[0]?.likes_count || 0
    const liked = existingLike.length > 0

    console.log("Like status:", { liked, likesCount })

    return NextResponse.json({
      liked,
      likes_count: Number(likesCount),
    })
  } catch (error) {
    console.error("Error checking like status:", error)
    return NextResponse.json({ error: "Failed to check like status" }, { status: 500 })
  }
}
