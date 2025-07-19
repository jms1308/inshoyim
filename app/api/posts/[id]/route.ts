import { fetchPostsFromSheet } from "@/lib/fetchPostsFromSheet"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const postId = Number.parseInt(params.id)
    if (isNaN(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 })
    }
    const posts = await fetchPostsFromSheet()
    if (posts.length > 0) {
      const firstRow = posts[0];
      console.log("Sample row from Google Sheet (single post):", firstRow);
      console.log("Keys in first row:", Object.keys(firstRow));
      console.log("Value for 'Name':", firstRow["Name"]);
    }
    // Robust getField logic
    const getField = (row: Record<string, string>, keys: string[], fallback = "") => {
      for (const key of keys) {
        const candidates = [key, key.trim(), key.toLowerCase(), key.toUpperCase()];
        for (const candidate of candidates) {
          if (row[candidate] && row[candidate].trim()) return row[candidate].trim();
        }
      }
      for (const k in row) {
        if (keys.some(key => k.trim().toLowerCase() === k.trim().toLowerCase()) && row[k] && row[k].trim()) {
          return row[k].trim();
        }
      }
      return fallback;
    };
    const post = posts.map((row, idx) => ({
      id: idx + 1,
      title: getField(row, ["name", "Name", "title", "Title"]),
      content: getField(row, ["text", "Text", "content", "Content"]),
      author: getField(row, ["by", "By", "author", "Author"], "Anonymous"),
      excerpt: getField(row, ["text", "Text", "content", "Content"]).slice(0, 150),
      created_at: row.created_at || row.Created_at || new Date().toISOString(),
      updated_at: row.updated_at || row.Updated_at || new Date().toISOString(),
      likes_count: Number(row.likes_count || row.Likes_count || 0),
      views_count: Number(row.views_count || row.Views_count || 0),
    })).find((p) => p.id === postId)
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }
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
