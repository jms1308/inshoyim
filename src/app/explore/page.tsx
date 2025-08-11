
'use client';

import { useEffect, useState } from 'react';
import { EssayCard } from "@/components/EssayCard";
import { Input } from "@/components/ui/input";
import { getPublishedPosts } from '@/lib/services/posts';
import type { Post } from '@/types';
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { Search } from "lucide-react";
import { Button } from '@/components/ui/button';

const INITIAL_LOAD_COUNT = 12;
const LOAD_MORE_COUNT = 6;

export default function ExplorePage() {
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
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
        if (charIndex < phrases[phraseIndex].length) {
          setDynamicText(phrases[phraseIndex].substring(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        } else {
          setTimeout(() => setIsDeleting(true), delayBetweenPhrases);
        }
      }
    };

    const timer = setTimeout(handleTyping, isDeleting ? deletingSpeed : typingSpeed);
    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, phraseIndex]);

  useEffect(() => {
    async function fetchInitialPosts() {
      try {
        setLoading(true);
        const { posts, lastVisible: newLastVisible } = await getPublishedPosts(INITIAL_LOAD_COUNT);
        setAllPosts(posts);
        setFilteredPosts(posts);
        setLastVisible(newLastVisible);
        setHasMore(posts.length === INITIAL_LOAD_COUNT);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    }
    // Only fetch if posts are not already loaded
    if (allPosts.length === 0) {
       fetchInitialPosts();
    }
  }, []); // Empty dependency array ensures this runs only once on initial mount

  const fetchMorePosts = async () => {
    if (!hasMore || loadingMore) return;

    setLoadingMore(true);
    try {
      const { posts: newPosts, lastVisible: newLastVisible } = await getPublishedPosts(LOAD_MORE_COUNT, lastVisible);
      const updatedPosts = [...allPosts, ...newPosts];
      setAllPosts(updatedPosts);
      // If searchTerm is active, we should filter the new posts as well
      const results = updatedPosts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredPosts(results);
      
      setLastVisible(newLastVisible);
      setHasMore(newPosts.length === LOAD_MORE_COUNT);
    } catch (error) {
      console.error("Error fetching more posts:", error);
    } finally {
      setLoadingMore(false);
    }
  };


  useEffect(() => {
    // When search term changes, filter from the already loaded posts
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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <EssayCard key={post.id} post={post} />
              ))}
            </div>
             {hasMore && !searchTerm && (
              <div className="mt-12 text-center">
                <Button onClick={fetchMorePosts} disabled={loadingMore}>
                  {loadingMore ? "Yuklanmoqda..." : "Ko'proq yuklash"}
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}
