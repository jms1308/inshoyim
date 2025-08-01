import { sql } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { countWords } from "@/lib/utils"
import { fetchPostsFromSheet } from "@/lib/fetchPostsFromSheet"

const MIN_WORD_COUNT = 100

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

// Helper to capitalize first letter of a string
function capitalizeFirst(str: string) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Simple time difference calculator, always treats Google Sheet time as GMT+5
function formatRelativeTime(timeString: string): string {
  if (!timeString || timeString.trim() === "") return "Just now";

  try {
    const cleanTimeString = timeString.trim();
    const match = cleanTimeString.match(/^([0-9]{1,2})\/([0-9]{1,2})\/([0-9]{4})\s+([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2})$/);
    let uploadTime: Date;

    if (match) {
      const [, month, day, year, hour, minute, second] = match;
      uploadTime = new Date(
        Date.UTC(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          parseInt(hour) - 5, // adjust for GMT+5
          parseInt(minute),
          parseInt(second)
        )
      );
    } else {
      uploadTime = new Date();
    }

    const now = new Date();
    const diffInMs = now.getTime() - uploadTime.getTime();
    if (diffInMs < 0) return "Just now";
    if (diffInMs < 60000) return "Just now";

    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    if (diffInYears >= 1) return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;
    if (diffInMonths >= 1) return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
    if (diffInDays >= 1) return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    if (diffInHours >= 1) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  } catch (error) {
    return "Just now";
  }
}

export async function GET(request: NextRequest) {
  try {
    // Fetch all posts from Google Sheets
    const posts = await fetchPostsFromSheet();

    // If Google Sheets fails, return empty response
    if (!posts || posts.length === 0) {
      console.log('No posts fetched from Google Sheets, returning empty response');
      return NextResponse.json({
        posts: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
      });
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

    // Filter out rows without a valid title
    const filteredPosts = posts.filter(row => {
      const title = getField(row, ["name", "Name", "title", "Title"]);
      return title && title.trim();
    });

    let safePosts = filteredPosts.map((row, idx) => {
      const title = getField(row, ["name", "Name", "title", "Title"]);
      const content = getField(row, ["text", "Text", "content", "Content"]);
      const author = getField(row, ["by", "By", "author", "Author"], "Anonymous");
      const uploadTime = getField(row, [
        "time", "Time", "TIME",
        "upload_time", "uploadTime", "upload time", "uploadTime", "Upload Time",
        "date", "Date", "DATE", 
        "created", "Created", "CREATED",
        "timestamp", "Timestamp", "TIMESTAMP",
        "submitted", "Submitted", "SUBMITTED",
        "form_response_timestamp", "Form Response Timestamp"
      ]);
      const apple = getField(row, ["apple", "Apple", "APPLE"]);
      const slug = slugify(title);

      return {
        id: slug,
        title: capitalizeFirst(title),
        content,
        author,
        upload_time: uploadTime ? formatRelativeTime(uploadTime) : "",
        upload_time_raw: uploadTime || "", // Add raw time for debugging
        excerpt: content.slice(0, 150),
        created_at: row.created_at || row.Created_at || new Date().toISOString(),
        updated_at: row.updated_at || row.Updated_at || new Date().toISOString(),
        apple,
        // Remove likes_count and views_count if not needed, or leave for compatibility
      };
    });

    // Implement search by title
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    if (search && search.trim()) {
      const searchLower = search.trim().toLowerCase();
      safePosts = safePosts.filter(post => post.title.toLowerCase().includes(searchLower));
    }



    // Reverse the order so last essay in sheet appears first
    safePosts.reverse();

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


    // Prepare variables for new post
    const slug = slugify(title);
    const now = new Date();
    const uploadTime = now.toISOString();
    const apple = "";


    let post;
    if (result && result[0]) {
      const row = result[0];
      post = {
        id: row.id,
        title: row.title,
        content: row.content,
        author: row.author,
        excerpt: row.excerpt,
        created_at: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
        updated_at: row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at),
        apple: row.apple || "",
      };
    } else {
      post = {
        id: slug,
        title: capitalizeFirst(title),
        content,
        author,
        upload_time: "",
        upload_time_raw: "",
        excerpt,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        apple,
      };
    }

    console.log("API: Successfully created post with ID:", post.id, "Word count:", wordCount)

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 })
  }
}
