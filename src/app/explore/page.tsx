
'use client';

import { useEffect, useState } from 'react';
import { EssayCard } from "@/components/EssayCard";
import { Input } from "@/components/ui/input";
import { getPublishedPosts } from '@/lib/services/posts';
import type { Post } from '@/types';
import { Search } from "lucide-react";

export default function ExplorePage() {
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const phrases = ['Insholar', 'Xulosalar', 'Tahlillar'];
  const [dynamicText, setDynamicText] = useState(phrases[0]);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(phrases[0].length);
  const [isDeleting, setIsDeleting] = useState(true);

  const typingSpeed = 150;
  const deletingSpeed = 100;
  const delayBetweenPhrases = 2000;

  useEffect(() => {
    const handleTyping = () => {
      const currentPhrase = phrases[phraseIndex];
      if (isDeleting) {
        if (charIndex > 0) {
          setDynamicText(currentPhrase.substring(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        } else {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % phrases.length);
        }
      } else {
        if (charIndex < currentPhrase.length) {
          setDynamicText(currentPhrase.substring(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        } else {
          setTimeout(() => setIsDeleting(true), delayBetweenPhrases);
        }
      }
    };

    const timer = setTimeout(handleTyping, isDeleting ? deletingSpeed : typingSpeed);
    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, phraseIndex, phrases]);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const posts = await getPublishedPosts();
        setAllPosts(posts);
        setFilteredPosts(posts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  useEffect(() => {
    const results = allPosts.filter(post =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredPosts(results);
  }, [searchTerm, allPosts]);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <section className="mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-center h-14">
          {dynamicText}
          <span className="animate-ping">|</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto text-center font-headline">
          Sarlavha, muallif yoki teg bo‘yicha qidirib, sizni qiziqtirgan insholarni toping.
        </p>
        <div className="relative mt-8 max-w-xl mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Insholarni qidirish..."
            className="pl-10 text-lg py-6 rounded-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </section>

      <section>
        {loading ? (
          <p className="text-center">Yuklanmoqda...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <EssayCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
