'use client';

import { useEffect, useState } from 'react';
import { EssayCard } from '@/components/EssayCard';
import { getPublishedPosts } from '@/lib/services/posts';
import type { Post } from '@/types';

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
          Notiq Insholar
        </h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Yozma so'z uchun boshpana. Fikrli insholarni, chuqur sharhlarni o'rganing va o'z ovozingizni baham ko'ring.
        </p>
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
