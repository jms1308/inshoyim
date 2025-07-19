import { sql } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { countWords } from "@/lib/utils"
import { fetchPostsFromSheet } from "@/lib/fetchPostsFromSheet"

const MIN_WORD_COUNT = 150

export async function GET(request: NextRequest) {
  try {
    // Fetch all posts from Google Sheets
    const posts = await fetchPostsFromSheet();

    // Debug: Log the first row's keys and the value for 'Name'
    if (posts.length > 0) {
      const firstRow = posts[0];
      console.log("Sample row from Google Sheet:", firstRow);
      console.log("Keys in first row:", Object.keys(firstRow));
      console.log("Value for 'Name':", firstRow["Name"]);
    }

    // Helper to get the first non-empty value from possible keys, trimming keys and values
    const getField = (row: Record<string, string>, keys: string[], fallback = "") => {
      for (const key of keys) {
        // Try direct, trimmed, and lowercased versions
        const candidates = [key, key.trim(), key.toLowerCase(), key.toUpperCase()];
        for (const candidate of candidates) {
          if (row[candidate] && row[candidate].trim()) return row[candidate].trim();
        }
      }
      // Try all keys in the row, trimmed
      for (const k in row) {
        if (keys.some(key => k.trim().toLowerCase() === key.trim().toLowerCase()) && row[k] && row[k].trim()) {
          return row[k].trim();
        }
      }
      return fallback;
    };

    // Map posts to expected structure using robust header matching
    let safePosts = posts.map((row, idx) => {
      const title = getField(row, ["name", "Name", "title", "Title"]);
      const content = getField(row, ["text", "Text", "content", "Content"]);
      const author = getField(row, ["by", "By", "author", "Author"], "Anonymous");
      return {
        id: idx + 1,
        title,
        content,
        author,
        excerpt: content.slice(0, 150),
        created_at: row.created_at || row.Created_at || new Date().toISOString(),
        updated_at: row.updated_at || row.Updated_at || new Date().toISOString(),
        likes_count: Number(row.likes_count || row.Likes_count || 0),
        views_count: Number(row.views_count || row.Views_count || 0),
      };
    });

    // Implement search by title
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    if (search && search.trim()) {
      const searchLower = search.trim().toLowerCase();
      safePosts = safePosts.filter(post => post.title.toLowerCase().includes(searchLower));
    }

    return NextResponse.json({
      posts: safePosts,
      pagination: {
        page: 1,
        limit: safePosts.length,
        total: safePosts.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
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
