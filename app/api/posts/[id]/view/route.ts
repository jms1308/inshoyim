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

    // Check if user already viewed this post
    const existingView = await sql`
      SELECT * FROM post_views 
      WHERE post_id = ${postId} AND user_ip = ${userIP}
    `

    if (existingView.length > 0) {
      // Already viewed, just return current count
      const posts = await sql`
        SELECT views_count FROM posts WHERE id = ${postId}
      `

      const viewsCount = posts[0]?.views_count || 0
      return NextResponse.json({
        success: true,
        views_count: Number(viewsCount),
        already_viewed: true,
      })
    }

    // Add view
    await sql`
      INSERT INTO post_views (post_id, user_ip, user_agent)
      VALUES (${postId}, ${userIP}, ${userAgent})
    `

    // Update post views count
    await sql`
      UPDATE posts 
      SET views_count = COALESCE(views_count, 0) + 1 
      WHERE id = ${postId}
    `

    // Get updated post data
    const posts = await sql`
      SELECT views_count FROM posts WHERE id = ${postId}
    `

    const viewsCount = posts[0]?.views_count || 0

    return NextResponse.json({
      success: true,
      views_count: Number(viewsCount),
      already_viewed: false,
    })
  } catch (error) {
    console.error("Error adding view:", error)
    return NextResponse.json({ error: "Failed to add view" }, { status: 500 })
  }
}
