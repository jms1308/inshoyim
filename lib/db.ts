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
   * - Returns ALL posts to ALL users (no user-based filtering)
   */
  const posts: any[] = [
    // Add diverse sample data for testing
    {
      id: 1,
      title: "Inshoyim Platformasiga Xush Kelibsiz",
      content:
        "Bu platforma imkoniyatlarini ko'rsatish uchun namuna insho. Inshoyim - Medium ga o'xshash uzun matnlarni ulashish uchun zamonaviy platforma. Siz insholar yozishingiz, o'z fikrlaringizni baham ko'rishingiz va izohlar orqali boshqa yozuvchilar bilan muloqot qilishingiz mumkin.\n\nPlatforma Next.js bilan qurilgan va Vercel da joylashtirilgan, bu uni tez va ishonchli qiladi. Siz tajribali yozuvchi bo'lasizmi yoki endigina boshlayotgan bo'lasizmi, Inshoyim sizning ijodingiz uchun toza, chalg'ituvchi elementlarsiz muhit taqdim etadi.\n\nBu yerda siz o'z hikoyalaringizni yozishingiz, boshqalar bilan ulashishingiz va keng auditoriya bilan bog'lanishingiz mumkin.",
      author: "Inshoyim Jamoasi",
      excerpt:
        "Bu platforma imkoniyatlarini ko'rsatish uchun namuna insho. Inshoyim - Medium ga o'xshash uzun matnlarni ulashish uchun zamonaviy platforma...",
      created_at: new Date(Date.now() - 86400000), // 1 day ago
      updated_at: new Date(Date.now() - 86400000),
      likes_count: 15,
      views_count: 89,
    },
    {
      id: 2,
      title: "Yozish San'ati",
      content:
        "Yozish ham san'at, ham hunarmandlikdir. Bu ijodkorlik, intizom va doimiy amaliyotni talab qiladi. Ushbu raqamli asrda Inshoyim kabi platformalar sizning fikrlaringizni dunyo bilan baham ko'rishni har qachongidan ham osonlashtiradi.\n\nYaxshi yozish aniq fikrlashdan boshlanadi. Qalam qog'ozga (yoki barmoqlaringizni klaviaturaga) qo'yishdan oldin, fikrlaringizni tartibga solish uchun vaqt ajrating. Siz qanday asosiy xabarni etkazmoqchisiz? Sizning auditoriyangiz kim? Qanday ohangni urmoqchisiz?\n\nEslab qoling, yozish - bu qayta yozishdir. Sizning birinchi qoralama faqat boshlanish. Haqiqiy sehr tahrirlash jarayonida sodir bo'ladi, bu yerda siz g'oyalaringizni aniqlashtirasiz va nasringizni sayqallaysiz.\n\nHar bir yozuvchi o'zining noyob ovoziga ega. Boshqalarni taqlid qilishga harakat qilmang - o'zingizning haqiqiy ovozingizni toping va rivojlantiring.",
      author: "Adabiyot Ishqibozi",
      excerpt:
        "Yozish ham san'at, ham hunarmandlikdir. Bu ijodkorlik, intizom va doimiy amaliyotni talab qiladi. Ushbu raqamli asrda Inshoyim kabi platformalar...",
      created_at: new Date(Date.now() - 172800000), // 2 days ago
      updated_at: new Date(Date.now() - 172800000),
      likes_count: 23,
      views_count: 156,
    },
    {
      id: 3,
      title: "Texnologiya va Kelajak",
      content:
        "Texnologiya hayotimizning har bir qismiga kirib keldi. Smartfonlardan sun'iy intellektgacha, biz texnologik inqilob o'rtasida yashayapmiz. Lekin bu o'zgarishlar nimani anglatadi va kelajakda bizni nima kutmoqda?\n\nSun'iy intellekt (AI) eng muhim texnologik yutuqlardan biri hisoblanadi. U tibbiyotdan ta'limgacha, transportdan moliyagacha barcha sohalarda inqilob qilmoqda. Ammo AI ning rivojlanishi bilan birga, yangi savollar ham paydo bo'lmoqda: ish o'rinlari qanday o'zgaradi? Maxfiylik va xavfsizlik masalalari qanday hal qilinadi?\n\nKelajakda muvaffaqiyatli bo'lish uchun biz doimiy o'rganishga va moslashishga tayyor bo'lishimiz kerak. Texnologiya vositadir, maqsad emas. Uni insoniyat manfaati uchun qanday ishlatishimiz muhim.\n\nYosh avlod uchun eng muhim ko'nikma - bu o'rganishni o'rganish. Chunki texnologiya tez o'zgaradi, lekin o'rganish qobiliyati doimo foydali bo'lib qoladi.",
      author: "Texnolog",
      excerpt:
        "Texnologiya hayotimizning har bir qismiga kirib keldi. Smartfonlardan sun'iy intellektgacha, biz texnologik inqilob o'rtasida yashayapmiz...",
      created_at: new Date(Date.now() - 259200000), // 3 days ago
      updated_at: new Date(Date.now() - 259200000),
      likes_count: 8,
      views_count: 67,
    },
    {
      id: 4,
      title: "O'zbekiston Tabiati",
      content:
        "O'zbekiston boy tabiiy boyliklariga ega mamlakat. Orol dengizidan Pamir tog'larigacha, cho'llardan yashil vodiylarigacha - bu yer ajoyib manzaralar bilan to'la.\n\nAral dengizi muammosi butun dunyoga ma'lum. Bir paytlar dunyoning to'rtinchi eng katta ko'li bo'lgan Aral dengizi inson faoliyati natijasida quriy boshladi. Bu ekologik fojia bizga tabiatni muhofaza qilish qanchalik muhimligini ko'rsatadi.\n\nAmmo O'zbekistonda ko'plab go'zal joylar ham bor. Chimyon tog'lari, Ugam-Chatqal milliy bog'i, Zarafshon vodiysi - bularning barchasi noyob tabiy manzaralar.\n\nBiz kelajak avlodlar uchun bu go'zalliklarni saqlab qolishimiz kerak. Har birimiz tabiatni muhofaza qilishda o'z hissamizni qo'shishimiz zarur.",
      author: "Tabiat Sevgisi",
      excerpt:
        "O'zbekiston boy tabiiy boyliklariga ega mamlakat. Orol dengizidan Pamir tog'larigacha, cho'llardan yashil vodiylarigacha...",
      created_at: new Date(Date.now() - 345600000), // 4 days ago
      updated_at: new Date(Date.now() - 345600000),
      likes_count: 31,
      views_count: 203,
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
        author: author || "Anonymous",
        excerpt,
        created_at: now,
        updated_at: now,
        likes_count: 0,
        views_count: 0,
      }
      posts.unshift(row) // Add to beginning for newest first
      console.log("Stub: Added new post, total posts:", posts.length)
      console.log("Stub: New post details:", { id: row.id, title: row.title.substring(0, 50), author: row.author })
      return [row]
    }

    if (upper.startsWith("UPDATE POSTS SET LIKES_COUNT")) {
      const postId = Number(args[args.length - 1]) // Last arg is usually the ID
      const post = posts.find((p) => p.id === postId)
      if (post) {
        if (upper.includes("+ 1")) {
          post.likes_count = (post.likes_count || 0) + 1
        } else if (upper.includes("- 1")) {
          post.likes_count = Math.max(0, (post.likes_count || 0) - 1)
        }
        console.log("Stub: Updated likes count for post", postId, "to", post.likes_count)
      }
      return []
    }

    if (upper.startsWith("UPDATE POSTS SET VIEWS_COUNT")) {
      const postId = Number(args[args.length - 1]) // Last arg is usually the ID
      const post = posts.find((p) => p.id === postId)
      if (post) {
        post.views_count = (post.views_count || 0) + 1
        console.log("Stub: Updated views count for post", postId, "to", post.views_count)
      }
      return []
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
        console.log("Stub: Search count for term '" + term + "':", count)
        return [{ total: count }]
      }
      console.log("Stub: Total posts count:", posts.length)
      return [{ total: posts.length }]
    }

    if (upper.startsWith("SELECT ID FROM POSTS WHERE ID")) {
      const id = Number(args[0])
      return posts.filter((p) => p.id === id).map((p) => ({ id: p.id }))
    }

    if (upper.startsWith("SELECT LIKES_COUNT FROM POSTS WHERE ID")) {
      const id = Number(args[0])
      const post = posts.find((p) => p.id === id)
      return post ? [{ likes_count: post.likes_count || 0 }] : []
    }

    if (upper.startsWith("SELECT VIEWS_COUNT FROM POSTS WHERE ID")) {
      const id = Number(args[0])
      const post = posts.find((p) => p.id === id)
      return post ? [{ views_count: post.views_count || 0 }] : []
    }

    // Main posts query - RETURN ALL POSTS TO EVERYONE
    if (upper.startsWith("SELECT ID, TITLE, CONTENT") && upper.includes("FROM POSTS")) {
      let filteredPosts = [...posts] // Start with ALL posts

      console.log("Stub: Starting with ALL posts:", posts.length)

      // Handle search filtering
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
        console.log("Stub: After search filter '" + term + "':", filteredPosts.length)
      }

      // Handle single post lookup
      if (upper.includes("WHERE ID =")) {
        const id = Number(args[args.length - 1]) // ID is usually the last arg
        const result = posts.filter((p) => p.id === id)
        console.log("Stub: Single post lookup for ID", id, "found:", result.length)
        return result
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
        `Stub: Returning ${paginatedPosts.length} posts (offset: ${offset}, limit: ${limit}, total available: ${filteredPosts.length})`,
      )

      // Log the posts being returned for debugging
      paginatedPosts.forEach((post, index) => {
        console.log(
          `Stub: Post ${index + 1}: ID=${post.id}, Title="${post.title.substring(0, 30)}...", Author="${post.author}"`,
        )
      })

      return paginatedPosts
    }

    /* ---- LIKES --------------------------------------------------------- */
    if (upper.startsWith("SELECT * FROM POST_LIKES WHERE POST_ID")) {
      const [post_id, user_ip] = args
      const result = postLikes.filter((l) => l.post_id === Number(post_id) && l.user_ip === user_ip)
      console.log("Stub: Found", result.length, "likes for post", post_id, "and IP", user_ip)
      return result
    }

    if (upper.startsWith("INSERT INTO POST_LIKES")) {
      const [post_id, user_ip, user_agent] = args
      const existingLike = postLikes.find((l) => l.post_id === Number(post_id) && l.user_ip === user_ip)
      if (existingLike) {
        console.log("Stub: Like already exists for post", post_id, "and IP", user_ip)
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
      console.log("Stub: Added like for post", post_id, "total likes:", postLikes.length)
      return [like]
    }

    if (upper.startsWith("DELETE FROM POST_LIKES WHERE POST_ID")) {
      const [post_id, user_ip] = args
      const index = postLikes.findIndex((l) => l.post_id === Number(post_id) && l.user_ip === user_ip)
      if (index !== -1) {
        postLikes.splice(index, 1)
        console.log("Stub: Removed like for post", post_id, "total likes:", postLikes.length)
        return [{ success: true }]
      }
      console.log("Stub: No like found to remove for post", post_id, "and IP", user_ip)
      return []
    }

    /* ---- VIEWS --------------------------------------------------------- */
    if (upper.startsWith("SELECT * FROM POST_VIEWS WHERE POST_ID")) {
      const [post_id, user_ip] = args
      const result = postViews.filter((v) => v.post_id === Number(post_id) && v.user_ip === user_ip)
      console.log("Stub: Found", result.length, "views for post", post_id, "and IP", user_ip)
      return result
    }

    if (upper.startsWith("INSERT INTO POST_VIEWS")) {
      const [post_id, user_ip, user_agent] = args
      const existingView = postViews.find((v) => v.post_id === Number(post_id) && v.user_ip === user_ip)
      if (existingView) {
        console.log("Stub: View already exists for post", post_id, "and IP", user_ip)
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
      console.log("Stub: Added view for post", post_id, "total views:", postViews.length)
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
