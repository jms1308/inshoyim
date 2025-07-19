import { sql } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const postId = Number.parseInt(params.id)

    if (isNaN(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 })
    }

    const comments = await sql`
      SELECT id, post_id, content, author, created_at 
      FROM comments 
      WHERE post_id = ${postId}
      ORDER BY created_at ASC
    `

    // Ensure structured-clone-safe response
    const safeComments = comments.map((row: any) => ({
      id: Number(row.id),
      post_id: Number(row.post_id),
      content: row.content,
      author: row.author,
      created_at: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    }))

    return NextResponse.json(safeComments)
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const postId = Number.parseInt(params.id)
    const { content, author } = await request.json()

    if (isNaN(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 })
    }

    if (!content) {
      return NextResponse.json({ error: "Comment content is required" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO comments (post_id, content, author)
      VALUES (${postId}, ${content}, ${author || "Anonymous"})
      RETURNING id, post_id, content, author, created_at
    `

    // Handle both real DB and stub responses
    let row = result[0] as any | undefined
    if (!row) {
      const now = new Date()
      row = {
        id: Date.now(),
        post_id: postId,
        content,
        author: author || "Anonymous",
        created_at: now,
      }
    }

    const comment = {
      id: Number(row.id),
      post_id: Number(row.post_id),
      content: row.content,
      author: row.author,
      created_at: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    }

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
  }
}
