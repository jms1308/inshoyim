import { notFound } from "next/navigation"
import Image from "next/image"
import { mockUsers, mockPosts } from "@/lib/mock-data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { EssayCard } from "@/components/EssayCard"

export default function ProfilePage({ params }: { params: { id: string } }) {
  const user = mockUsers.find((u) => u.id === params.id)
  
  if (!user) {
    notFound()
  }

  const userPosts = mockPosts.filter(
    (p) => p.author_id === user.id && p.status === "published"
  )
  const authorInitials = user.name.split(' ').map(n => n[0]).join('') || 'U';


  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 md:py-16">
      <section className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
        <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-primary/20">
          <AvatarImage src={user.avatar_url} alt={user.name} data-ai-hint="avatar" />
          <AvatarFallback className="text-4xl">{authorInitials}</AvatarFallback>
        </Avatar>
        <div className="text-center md:text-left">
          <h1 className="font-headline text-4xl md:text-5xl font-bold">{user.name}</h1>
          <p className="mt-2 text-lg text-muted-foreground">{user.email}</p>
          <p className="mt-4 max-w-xl text-foreground/80">{user.bio}</p>
        </div>
      </section>

      <section>
        <h2 className="font-headline text-3xl font-bold mb-8 border-b pb-4">
          Publications
        </h2>
        {userPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {userPosts.map((post) => (
              <EssayCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-10">
            This author has not published any essays yet.
          </p>
        )}
      </section>
    </div>
  )
}
