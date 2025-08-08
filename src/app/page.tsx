import { EssayCard } from '@/components/EssayCard';
import { TagGenerator } from '@/components/TagGenerator';
import { mockPosts } from '@/lib/mock-data';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <section className="text-center py-12 md:py-20">
        <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tighter leading-tight">
          Eloquent Essays
        </h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          A sanctuary for the written word. Explore thoughtful essays, in-depth reviews, and share your own voice.
        </p>
      </section>

      <section>
        <h2 className="font-headline text-3xl font-bold mb-8 text-center md:text-left">Recent Publications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockPosts.filter(p => p.status === 'published').slice(0, 6).map((post) => (
            <EssayCard key={post.id} post={post} />
          ))}
        </div>
      </section>

      <section className="mt-16 md:mt-24">
         <div className="max-w-3xl mx-auto">
            <h2 className="font-headline text-3xl font-bold mb-4 text-center">AI-Powered Tagging</h2>
            <p className="text-muted-foreground text-center mb-8">
              Paste your essay content below and let our AI suggest relevant tags to improve discoverability.
            </p>
            <TagGenerator />
        </div>
      </section>
    </div>
  );
}
