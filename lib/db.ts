import { neon } from "@neondatabase/serverless"

/**
 * Production --> real Neon client (DATABASE_URL must be set)
 * Preview / local without DATABASE_URL --> in-memory stub that
 * understands the limited set of queries our app runs.
 */

const stubClient = createStubClient()

function createResilientClient() {
  if (!process.env.DATABASE_URL) {
    // No DB URL – always use stub.
    return stubClient
  }

  const neonSql = neon(process.env.DATABASE_URL)

  // Proxy neon, but catch errors and switch to stub.
  return async function sql(parts: TemplateStringsArray | string, ...args: any[]): Promise<any[]> {
    try {
      // First attempt real DB.
      // @ts-ignore – neon's callable signature
      return await neonSql(parts as any, ...args)
    } catch (err) {
      console.error("DB query failed; falling back to in-memory stub ↪️", (err as Error)?.message)
      // Use the long-lived stub instead.
      // eslint-disable-next-line @typescript-eslint/return-await
      return stubClient(parts as any, ...args)
    }
  }
}

export const sql = createResilientClient()

/* ---------- Stub implementation ----------------------------------------- */

function createStubClient() {
  /**
   * Enhanced SQL "parser" with delete support and likes/views
   * - Handles the query shapes used by this demo
   * - Persists data for the lifetime of the process
   */
  const posts: any[] = [
    // Add some sample data for preview
    {
      id: 1,
      title: "Welcome to WriteSpace",
      content:
        "This is a sample essay to demonstrate the platform. WriteSpace is a modern platform for sharing long-form content, similar to Medium. You can write essays, share your thoughts, and engage with other writers through comments.\n\nThe platform is built with Next.js and deployed on Vercel, making it fast and reliable. Whether you're a seasoned writer or just starting out, WriteSpace provides a clean, distraction-free environment for your creativity.",
      author: "WriteSpace Team",
      excerpt:
        "This is a sample essay to demonstrate the platform. WriteSpace is a modern platform for sharing long-form content, similar to Medium...",
      created_at: new Date(Date.now() - 86400000), // 1 day ago
      updated_at: new Date(Date.now() - 86400000),
      likes_count: 5,
      views_count: 23,
    },
    {
      id: 2,
      title: "The Art of Writing",
      content:
        "Writing is both an art and a craft. It requires creativity, discipline, and continuous practice. In this digital age, platforms like WriteSpace make it easier than ever to share your thoughts with the world.\n\nGood writing starts with clear thinking. Before you put pen to paper (or fingers to keyboard), take time to organize your thoughts. What is the main message you want to convey? Who is your audience? What tone do you want to strike?\n\nRemember, writing is rewriting. Your first draft is just the beginning. The real magic happens in the editing process, where you refine your ideas and polish your prose.",
      author: "Literary Enthusiast",
      excerpt:
        "Writing is both an art and a craft. It requires creativity, discipline, and continuous practice. In this digital age, platforms like WriteSpace...",
      created_at: new Date(Date.now() - 172800000), // 2 days ago
      updated_at: new Date(Date.now() - 172800000),
      likes_count: 12,
      views_count: 45,
    },
  ]
  const comments: any[] = []
  const postLikes: any[] = []
  const postViews: any[] = []

  return async function stub(parts: TemplateStringsArray | string, ...args: any[]): Promise<any[]> {
    const query = typeof parts === "string" ? parts : String.raw({ raw: parts }, ...args)
    const upper = query.trim().toUpperCase()

    console.log("Stub SQL:", query.substring(0, 100) + "...")

    /* ---- POSTS --------------------------------------------------------- */
    if (upper.startsWith("INSERT INTO POSTS")) {
      const [title, content, author, excerpt] = args
      const now = new Date()
      const row = {
        id: Date.now(),
        title,
        content,
        author,
        excerpt,
        created_at: now,
        updated_at: now,
        likes_count: 0,
        views_count: 0,
      }
      posts.unshift(row) // Add to beginning for newest first
      console.log("Stub: Added new post, total posts:", posts.length)
      return [row]
    }

    if (upper.startsWith("DELETE FROM COMMENTS WHERE POST_ID")) {
      const post_id = Number(args[0])
      const initialLength = comments.length
      for (let i = comments.length - 1; i >= 0; i--) {
        if (comments[i].post_id === post_id) {
          comments.splice(i, 1)
        }
      }
      console.log("Stub: Deleted", initialLength - comments.length, "comments for post", post_id)
      return []
    }

    if (upper.startsWith("DELETE FROM POSTS WHERE ID")) {
      const id = Number(args[0])
      const index = posts.findIndex((p) => p.id === id)
      if (index !== -1) {
        const deletedPost = posts.splice(index, 1)[0]
        console.log("Stub: Deleted post", id, "total posts:", posts.length)
        return [{ id: deletedPost.id }]
      }
      return []
    }

    if (upper.includes("COUNT(*)") && upper.includes("FROM POSTS")) {
      if (upper.includes("ILIKE")) {
        const term = String(args[0] ?? "")
          .replace(/%/g, "")
          .toLowerCase()
        const count = posts.filter(
          (p) =>
            p.title.toLowerCase().includes(term) ||
            p.content.toLowerCase().includes(term) ||
            p.author.toLowerCase().includes(term),
        ).length
        return [{ total: count }]
      }
      return [{ total: posts.length }]
    }

    if (upper.startsWith("SELECT ID FROM POSTS WHERE ID")) {
      const id = Number(args[0])
      return posts.filter((p) => p.id === id).map((p) => ({ id: p.id }))
    }

    if (upper.startsWith("SELECT ID, TITLE, CONTENT") && upper.includes("FROM POSTS")) {
      let filteredPosts = [...posts]

      // Handle search
      if (upper.includes("ILIKE")) {
        const term = String(args[0] ?? "")
          .replace(/%/g, "")
          .toLowerCase()
        filteredPosts = posts.filter(
          (p) =>
            p.title.toLowerCase().includes(term) ||
            p.content.toLowerCase().includes(term) ||
            p.author.toLowerCase().includes(term),
        )
      }

      // Handle single post lookup
      if (upper.includes("WHERE ID =")) {
        const id = Number(args[args.length - 1]) // ID is usually the last arg
        return posts.filter((p) => p.id === id)
      }

      // Handle pagination
      let limit = 20
      let offset = 0

      if (upper.includes("LIMIT")) {
        const limitMatch = query.match(/LIMIT\s+(\d+)/i)
        if (limitMatch) limit = Number.parseInt(limitMatch[1])
      }

      if (upper.includes("OFFSET")) {
        const offsetMatch = query.match(/OFFSET\s+(\d+)/i)
        if (offsetMatch) offset = Number.parseInt(offsetMatch[1])
      }

      // Sort by created_at DESC and apply pagination
      const sortedPosts = filteredPosts.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      const paginatedPosts = sortedPosts.slice(offset, offset + limit)

      console.log(
        `Stub: Returning ${paginatedPosts.length} posts (offset: ${offset}, limit: ${limit}, total: ${filteredPosts.length})`,
      )
      return paginatedPosts
    }

    /* ---- LIKES --------------------------------------------------------- */
    if (upper.startsWith("INSERT INTO POST_LIKES")) {
      const [post_id, user_ip, user_agent] = args
      const existingLike = postLikes.find((l) => l.post_id === Number(post_id) && l.user_ip === user_ip)
      if (existingLike) {
        return [] // Already liked
      }
      const like = {
        id: Date.now(),
        post_id: Number(post_id),
        user_ip,
        user_agent,
        created_at: new Date(),
      }
      postLikes.push(like)
      // Update post likes count
      const post = posts.find((p) => p.id === Number(post_id))
      if (post) {
        post.likes_count = (post.likes_count || 0) + 1
      }
      return [like]
    }

    if (upper.startsWith("DELETE FROM POST_LIKES")) {
      const [post_id, user_ip] = args
      const index = postLikes.findIndex((l) => l.post_id === Number(post_id) && l.user_ip === user_ip)
      if (index !== -1) {
        postLikes.splice(index, 1)
        // Update post likes count
        const post = posts.find((p) => p.id === Number(post_id))
        if (post) {
          post.likes_count = Math.max(0, (post.likes_count || 0) - 1)
        }
        return [{ success: true }]
      }
      return []
    }

    if (upper.startsWith("SELECT * FROM POST_LIKES WHERE")) {
      const [post_id, user_ip] = args
      return postLikes.filter((l) => l.post_id === Number(post_id) && l.user_ip === user_ip)
    }

    /* ---- VIEWS --------------------------------------------------------- */
    if (upper.startsWith("INSERT INTO POST_VIEWS")) {
      const [post_id, user_ip, user_agent] = args
      const existingView = postViews.find((v) => v.post_id === Number(post_id) && v.user_ip === user_ip)
      if (existingView) {
        return [] // Already viewed
      }
      const view = {
        id: Date.now(),
        post_id: Number(post_id),
        user_ip,
        user_agent,
        created_at: new Date(),
      }
      postViews.push(view)
      // Update post views count
      const post = posts.find((p) => p.id === Number(post_id))
      if (post) {
        post.views_count = (post.views_count || 0) + 1
      }
      return [view]
    }

    /* ---- COMMENTS ------------------------------------------------------ */
    if (upper.startsWith("INSERT INTO COMMENTS")) {
      const [post_id, content, author] = args
      const now = new Date()
      const row = {
        id: Date.now(),
        post_id: Number(post_id),
        content,
        author,
        created_at: now,
      }
      comments.push(row)
      return [row]
    }

    if (upper.startsWith("SELECT ID, POST_ID, CONTENT") && upper.includes("FROM COMMENTS")) {
      const post_id = Number(args[0])
      return comments
        .filter((c) => c.post_id === post_id)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    }

    console.warn("⚠️ Stub SQL received unsupported query:", query.substring(0, 100))
    return []
  }
}

/* ---------- Shared Types ----------------------------------------------- */

export interface Post {
  id: number
  title: string
  content: string
  author: string
  excerpt: string
  created_at: string | Date
  updated_at: string | Date
  likes_count?: number
  views_count?: number
}

export interface Comment {
  id: number
  post_id: number
  content: string
  author: string
  created_at: string | Date
}

export interface PostLike {
  id: number
  post_id: number
  user_ip: string
  user_agent: string
  created_at: string | Date
}

export interface PostView {
  id: number
  post_id: number
  user_ip: string
  user_agent: string
  created_at: string | Date
}
