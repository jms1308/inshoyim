
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EssayCard } from "@/components/EssayCard";
import { AuthorCard } from "@/components/AuthorCard";
import { Input } from "@/components/ui/input";
import { usePosts } from '@/context/PostContext';
import { Search } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { User, Post } from '@/types';

type AuthorWithPostCount = User & { postCount: number };

function EssayCardSkeleton() {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>
      <CardContent className="flex-grow space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4">
        <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <div className="w-full flex items-center justify-between">
             <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
            </div>
        </div>
      </CardFooter>
    </Card>
  )
}


export default function ExplorePage() {
  const { posts: allPosts, loading } = usePosts();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'most_viewed'>('newest');
  const router = useRouter();

  const filteredPosts = useMemo(() => {
    let posts = allPosts;

    if (searchTerm) {
      posts = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        post.author?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortOrder === 'most_viewed') {
      return [...posts].sort((a, b) => b.views - a.views);
    }
    
    // Default is 'newest', which is already sorted from the context.
    return posts;

  }, [searchTerm, allPosts, sortOrder]);
  
  const authors: AuthorWithPostCount[] = useMemo(() => {
    const authorMap = new Map<string, AuthorWithPostCount>();
    
    allPosts.forEach(post => {
      if (post.author) {
        if (authorMap.has(post.author.id)) {
          authorMap.get(post.author.id)!.postCount++;
        } else {
          authorMap.set(post.author.id, {
            ...post.author,
            postCount: 1,
          });
        }
      }
    });

    let authorList = Array.from(authorMap.values());
    
    if (searchTerm) {
        authorList = authorList.filter(author => 
            author.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    return authorList.sort((a,b) => b.postCount - a.postCount);
  }, [allPosts, searchTerm]);

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
        const nextPhrase = phrases[phraseIndex];
        if (charIndex < nextPhrase.length) {
          setDynamicText(nextPhrase.substring(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        } else {
          setTimeout(() => setIsDeleting(true), delayBetweenPhrases);
        }
      }
    };

    const timer = setTimeout(handleTyping, isDeleting ? deletingSpeed : typingSpeed);
    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, phraseIndex, phrases]);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <section className="animate-fade-in-up">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-center h-14">
          {dynamicText}
          <span className="animate-ping">|</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto text-center font-headline">
          Sarlavha, muallif yoki teg bo‘yicha qidirib, sizni qiziqtirgan insholar va mualliflarni toping.
        </p>
        <div className="relative mt-8 max-w-xl mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Insholar yoki mualliflarni qidirish..."
            className="pl-10 text-lg py-6 rounded-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </section>

       <section className="mt-12">
        <Tabs defaultValue="essays" className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <TabsList className="grid w-full sm:w-auto grid-cols-2">
                    <TabsTrigger value="essays">Barcha Insholar</TabsTrigger>
                    <TabsTrigger value="authors">Mualliflar</TabsTrigger>
                </TabsList>
                 <div className="w-full sm:w-auto">
                     <Select value={sortOrder} onValueChange={(value: 'newest' | 'most_viewed') => setSortOrder(value)}>
                        <SelectTrigger className="w-full sm:w-[200px]">
                            <SelectValue placeholder="Saralash" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Eng so'nggilari</SelectItem>
                            <SelectItem value="most_viewed">Eng ko'p ko'rilganlar</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>
            </div>

            <TabsContent value="essays">
                 {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <EssayCardSkeleton key={index} />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredPosts.map((post, index) => (
                        <div 
                            key={post.id} 
                            className="animate-fade-in-up" 
                            style={{ animationDelay: `${index * 100}ms`}}
                        >
                            <EssayCard post={post} />
                        </div>
                        ))}
                    </div>
                )}
            </TabsContent>
            <TabsContent value="authors">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, index) => (
                             <Card key={index} className="p-4 space-y-3">
                                <div className="flex items-center gap-4">
                                    <Skeleton className="h-16 w-16 rounded-full" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-5 w-24" />
                                        <Skeleton className="h-4 w-16" />
                                    </div>
                                </div>
                             </Card>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {authors.map((author, index) => (
                             <div 
                                key={author.id} 
                                className="animate-fade-in-up" 
                                style={{ animationDelay: `${index * 100}ms`}}
                            >
                                <AuthorCard author={author} />
                            </div>
                        ))}
                    </div>
                )}
            </TabsContent>
        </Tabs>
      </section>
    </div>
  )
}
