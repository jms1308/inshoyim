import { sql } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { countWords } from "@/lib/utils"

const MIN_WORD_COUNT = 150

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = (page - 1) * limit

    console.log("API: Fetching ALL posts with params:", { search, page, limit, offset })

    let posts: any[] = []
    let totalCount = 0

    if (search && search.trim()) {
      // Search query - get ALL matching posts regardless of author
      const searchTerm = `%${search.trim()}%`
      console.log("API: Performing search with term:", searchTerm)

      posts = await sql`
        SELECT id, title, content, author, excerpt, created_at, updated_at, 
               COALESCE(likes_count, 0) as likes_count, 
               COALESCE(views_count, 0) as views_count
        FROM posts 
        WHERE title ILIKE ${searchTerm} OR content ILIKE ${searchTerm} OR author ILIKE ${searchTerm}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `

      const countResult = await sql`
        SELECT COUNT(*) as total 
        FROM posts 
        WHERE title ILIKE ${searchTerm} OR content ILIKE ${searchTerm} OR author ILIKE ${searchTerm}
      `
      totalCount = Number(countResult[0]?.total || 0)
    } else {
      // Get ALL posts from ALL users - no filtering by author or user
      console.log("API: Fetching ALL posts without search filter")

      posts = await sql`
        SELECT id, title, content, author, excerpt, created_at, updated_at,
               COALESCE(likes_count, 0) as likes_count, 
               COALESCE(views_count, 0) as views_count
        FROM posts 
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `

      const countResult = await sql`SELECT COUNT(*) as total FROM posts`
      totalCount = Number(countResult[0]?.total || 0)
    }

    console.log(`API: Found ${posts.length} posts out of ${totalCount} total posts in database`)

    // Log first few post titles for debugging
    if (posts.length > 0) {
      console.log(
        "API: Sample posts:",
        posts.slice(0, 3).map((p) => ({ id: p.id, title: p.title?.substring(0, 50), author: p.author })),
      )
    }

    // Ensure structured-clone-safe response with all required fields
    const safePosts = posts.map((row: any) => ({
      id: Number(row.id),
      title: row.title || "",
      content: row.content || "",
      author: row.author || "Anonymous",
      excerpt: row.excerpt || "",
      created_at: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
      updated_at: row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at),
      likes_count: Number(row.likes_count || 0),
      views_count: Number(row.views_count || 0),
    }))

    console.log(`API: Returning ${safePosts.length} processed posts`)

    return NextResponse.json({
      posts: safePosts,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("API: Error fetching posts:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch posts",
        posts: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, content, author } = await request.json()

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
    }

    // Validate minimum word count
    const wordCount = countWords(content)
    if (wordCount < MIN_WORD_COUNT) {
      return NextResponse.json(
        {
          error: `Essay content must be at least ${MIN_WORD_COUNT} words. Current word count: ${wordCount}`,
        },
        { status: 400 },
      )
    }

    // Generate excerpt from content (first 150 characters)
    const excerpt = content.length > 150 ? content.substring(0, 150) + "..." : content

    console.log("API: Creating new post:", {
      title: title.substring(0, 50),
      author: author || "Anonymous",
      wordCount,
      characterCount: content.length,
      meetsMinimum: wordCount >= MIN_WORD_COUNT,
    })

    const result = await sql`
      INSERT INTO posts (title, content, author, excerpt, likes_count, views_count)
      VALUES (${title}, ${content}, ${author || "Anonymous"}, ${excerpt}, 0, 0)
      RETURNING id, title, content, author, excerpt, created_at, updated_at, likes_count, views_count
    `

    // Handle both real DB and stub responses
    let row = result[0] as any | undefined
    if (!row) {
      const now = new Date()
      row = {
        id: Date.now(),
        title,
        content,
        author: author || "Anonymous",
        excerpt,
        created_at: now,
        updated_at: now,
        likes_count: 0,
        views_count: 0,
      }
    }

    const post = {
      id: Number(row.id),
      title: row.title,
      content: row.content,
      author: row.author,
      excerpt: row.excerpt,
      created_at: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
      updated_at: row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at),
      likes_count: Number(row.likes_count || 0),
      views_count: Number(row.views_count || 0),
    }

    console.log("API: Successfully created post with ID:", post.id, "Word count:", wordCount)

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 })
  }
}
