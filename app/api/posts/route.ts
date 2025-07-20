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

// Helper to format time as relative time - handles all possible formats
function formatRelativeTime(timeString: string): string {
  if (!timeString || timeString.trim() === "") return "";
  
  try {
    // Clean the time string
    const cleanTimeString = timeString.trim();
    
    // If it's already a relative time format, return as is
    if (cleanTimeString.includes('ago') || cleanTimeString.includes('minute') || cleanTimeString.includes('hour') || cleanTimeString.includes('day') || cleanTimeString.includes('week') || cleanTimeString.includes('month') || cleanTimeString.includes('year')) {
      return cleanTimeString;
    }
    
    // Try multiple date parsing strategies
    let uploadTime: Date | null = null;
    
    // Strategy 1: Google Sheets specific format (M/D/YYYY H:M:S) - PRIORITY
    const googleSheetsMatch = cleanTimeString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{1,2}):(\d{1,2})$/);
    if (googleSheetsMatch) {
      const [, month, day, year, hour, minute, second] = googleSheetsMatch;
      uploadTime = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute), parseInt(second));
      if (!isNaN(uploadTime.getTime())) {
        console.log(`Time: "${cleanTimeString}" -> Google Sheets format (M/D/YYYY H:M:S)`);
      }
    }
    
    // Strategy 2: ISO 8601 format (2023-12-25T14:30:00.000Z)
    if (!uploadTime || isNaN(uploadTime.getTime())) {
      if (cleanTimeString.includes('T') || cleanTimeString.includes('Z')) {
        uploadTime = new Date(cleanTimeString);
        if (!isNaN(uploadTime.getTime())) {
          console.log(`Time: "${cleanTimeString}" -> ISO format`);
        }
      }
    }
    
    // Strategy 3: Standard date format (12/25/2023 14:30:00)
    if (!uploadTime || isNaN(uploadTime.getTime())) {
      uploadTime = new Date(cleanTimeString);
      if (!isNaN(uploadTime.getTime())) {
        console.log(`Time: "${cleanTimeString}" -> Standard format`);
      }
    }
    
    // Strategy 4: Date only (12/25/2023)
    if (!uploadTime || isNaN(uploadTime.getTime())) {
      const dateOnly = cleanTimeString.split(' ')[0];
      uploadTime = new Date(dateOnly);
      if (!isNaN(uploadTime.getTime())) {
        console.log(`Time: "${cleanTimeString}" -> Date only format`);
      }
    }
    
    // Strategy 5: DD/MM/YYYY format
    if (!uploadTime || isNaN(uploadTime.getTime())) {
      const parts = cleanTimeString.split('/');
      if (parts.length === 3) {
        // Try DD/MM/YYYY
        uploadTime = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        if (!isNaN(uploadTime.getTime())) {
          console.log(`Time: "${cleanTimeString}" -> DD/MM/YYYY format`);
        }
      }
    }
    
    // Strategy 6: MM/DD/YYYY format
    if (!uploadTime || isNaN(uploadTime.getTime())) {
      const parts = cleanTimeString.split('/');
      if (parts.length === 3) {
        // Try MM/DD/YYYY
        uploadTime = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
        if (!isNaN(uploadTime.getTime())) {
          console.log(`Time: "${cleanTimeString}" -> MM/DD/YYYY format`);
        }
      }
    }
    
    // Strategy 7: YYYY-MM-DD format
    if (!uploadTime || isNaN(uploadTime.getTime())) {
      if (/^\d{4}-\d{2}-\d{2}/.test(cleanTimeString)) {
        uploadTime = new Date(cleanTimeString);
        if (!isNaN(uploadTime.getTime())) {
          console.log(`Time: "${cleanTimeString}" -> YYYY-MM-DD format`);
        }
      }
    }
    
    // Strategy 8: Unix timestamp
    if (!uploadTime || isNaN(uploadTime.getTime())) {
      const timestamp = parseInt(cleanTimeString);
      if (!isNaN(timestamp) && timestamp > 0) {
        uploadTime = new Date(timestamp);
        if (!isNaN(uploadTime.getTime())) {
          console.log(`Time: "${cleanTimeString}" -> Unix timestamp`);
        }
      }
    }
    
    // If all parsing strategies failed, return "Recently"
    if (!uploadTime || isNaN(uploadTime.getTime())) {
      console.log(`Time: "${cleanTimeString}" -> Recently (parse failed)`);
      return "Recently";
    }
    
    // Use server time for consistent comparison
    const now = new Date();
    const diffInMs = now.getTime() - uploadTime.getTime();
    
    // If the difference is negative (future date), return "Recently"
    if (diffInMs < 0) {
      console.log(`Time: "${cleanTimeString}" -> Recently (future date) - uploadTime: ${uploadTime.toISOString()}, now: ${now.toISOString()}, diff: ${diffInMs}ms`);
      return "Recently";
    }
    
    // If it's less than 1 minute, return "Just now"
    if (diffInMs < 60000) {
      console.log(`Time: "${cleanTimeString}" -> Just now`);
      return "Just now";
    }
    
    // Calculate time differences
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);
    
    // Format the result
    let result = "";
    if (diffInMinutes < 60) {
      result = `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      result = `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      result = `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    } else if (diffInWeeks < 4) {
      result = `${diffInWeeks} week${diffInWeeks !== 1 ? 's' : ''} ago`;
    } else if (diffInMonths < 12) {
      result = `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
    } else {
      result = `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;
    }
    
    console.log(`Time: "${cleanTimeString}" -> "${result}" - uploadTime: ${uploadTime.toISOString()}, now: ${now.toISOString()}, diff: ${diffInMs}ms`);
    return result;
    
  } catch (error) {
    console.log(`Time: "${timeString}" -> Recently (error)`);
    return "Recently"; // Return a safe fallback
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

    // Debug: Log the first row's keys and all time-related values
    if (posts.length > 0) {
      const firstRow = posts[0];
      console.log("Sample row from Google Sheet:", firstRow);
      console.log("Keys in first row:", Object.keys(firstRow));
      console.log("All time-related fields:");
      Object.keys(firstRow).forEach(key => {
        if (key.toLowerCase().includes('time') || key.toLowerCase().includes('date') || key.toLowerCase().includes('created') || key.toLowerCase().includes('upload')) {
          console.log(`  ${key}: "${firstRow[key]}"`);
        }
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

    // Log all generated slugs for debugging
    console.log("Essay slugs:", safePosts.map(p => p.id));

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
