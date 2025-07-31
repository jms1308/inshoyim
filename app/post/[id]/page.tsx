import { notFound } from "next/navigation"
import PostPageClient from "./PostPageClient"
import { fetchPostsFromSheet } from "@/lib/fetchPostsFromSheet"

// Helper to generate a URL-safe slug from a string
function slugify(str: string) {
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/-+/g, '-'); // Remove multiple -
}

async function getPost(slug: string) {
  const posts = await fetchPostsFromSheet();
  // Helper to robustly get a field from a row with possible key variations
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
  return posts.map((row) => {
    const title = getField(row, ["name", "Name", "title", "Title"]);
    const content = getField(row, ["text", "Text", "content", "Content"]);
    const author = getField(row, ["by", "By", "author", "Author"], "Anonymous");
    const postSlug = slugify(title);
    // Universal view count extraction from any possible key
    // Read 'Apple' column from Google Sheet
    const apple = row.Apple || row.apple || "1";
    return {
      id: postSlug,
      title,
      content,
      author,
      excerpt: content.slice(0, 150),
      created_at: row.created_at || row.Created_at || new Date().toISOString(),
      updated_at: row.updated_at || row.Updated_at || new Date().toISOString(),
      apple, // string from Google Sheet Apple column
    };
  }).find((p) => p.id === slug) || null;
}

  const post = await getPost(params.id)
  if (!post) {
    notFound()
  }
  return <PostPageClient postId={post.id} initialPost={post} initialComments={[]} apple={post.apple} />
}
