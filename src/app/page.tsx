'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { EssayCard } from '@/components/EssayCard';
import { getPublishedPosts } from '@/lib/services/posts';
import type { Post } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowRight, Edit } from 'lucide-react';

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const publishedPosts = await getPublishedPosts(6);
        setPosts(publishedPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <section className="text-center py-12 md:py-20">
        <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tighter leading-tight">
          Inshoyim
        </h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          O‘z g‘oyalaringizni barcha bilan bo‘lishishga tayyormisiz? Bizning platformamizda har kim o‘z fikrini erkin ifoda eta oladi.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/explore">
                <Button size="lg" variant="outline">
                    Insholarni o'rganish
                    <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
            </Link>
            <Link href="/yozish">
                 <Button size="lg">
                    Yozishni boshlash
                    <Edit className="ml-2 h-5 w-5" />
                </Button>
            </Link>
        </div>
      </section>

      <section>
        <h2 className="font-headline text-3xl font-bold mb-8 text-center md:text-left">So'nggi nashrlar</h2>
        {loading ? (
          <p>Yuklanmoqda...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <EssayCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
