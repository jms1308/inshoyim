import { notFound } from "next/navigation"
import PostPageClient from "./PostPageClient"
import { fetchPostsFromSheet } from "@/lib/fetchPostsFromSheet"

async function getPost(id: number) {
  const posts = await fetchPostsFromSheet()
  if (posts.length > 0) {
    const firstRow = posts[0];
    console.log("Sample row from Google Sheet (post page):", firstRow);
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
  return posts.map((row, idx) => ({
    id: idx + 1,
    title: getField(row, ["name", "Name", "title", "Title"]),
    content: getField(row, ["text", "Text", "content", "Content"]),
    author: getField(row, ["by", "By", "author", "Author"], "Anonymous"),
    excerpt: getField(row, ["text", "Text", "content", "Content"]).slice(0, 150),
    created_at: row.created_at || row.Created_at || new Date().toISOString(),
    updated_at: row.updated_at || row.Updated_at || new Date().toISOString(),
    likes_count: Number(row.likes_count || row.Likes_count || 0),
    views_count: Number(row.views_count || row.Views_count || 0),
  })).find((p) => p.id === id) || null
}

export default async function PostPage({ params }: { params: { id: string } }) {
  const postId = Number.parseInt(params.id)
  if (isNaN(postId)) {
    notFound()
  }
  const post = await getPost(postId)
  if (!post) {
    notFound()
  }
  // Comments logic can remain if still using DB for comments
  return <PostPageClient postId={postId} initialPost={post} initialComments={[]} />
}
