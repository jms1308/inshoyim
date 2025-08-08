import { EssayCard } from "@/components/EssayCard";
import { Input } from "@/components/ui/input";
import { mockPosts } from "@/lib/mock-data";
import { Search } from "lucide-react";

export default function ExplorePage() {
  const allPosts = mockPosts.filter(p => p.status === 'published');

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <section className="mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-center">Explore Essays</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto text-center">
          Dive into our collection. Search by title, author, or tag to find your next great read.
        </p>
        <div className="relative mt-8 max-w-xl mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search essays..."
            className="pl-10 text-lg py-6 rounded-full"
          />
        </div>
      </section>

      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allPosts.map((post) => (
            <EssayCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </div>
  )
}
