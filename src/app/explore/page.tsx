
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EssayCard } from "@/components/EssayCard";
import { AuthorCard } from "@/components/AuthorCard";
import { Input } from "@/components/ui/input";
import { usePosts } from '@/context/PostContext';
import { Search, ListFilter, Loader2 } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button';
import type { User, Post } from '@/types';
import { getAllUsers } from '@/lib/services/users';

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

const INITIAL_LOAD_COUNT = 9;

export default function ExplorePage() {
  const { 
    posts: displayedPosts, 
    loading: postsLoading, 
    loadMorePosts, 
    hasMore, 
    allPosts,
    allPostsLoaded,
    postsPerPage,
    currentPage
  } = usePosts();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'most_viewed'>('newest');
  const [isMobile, setIsMobile] = useState(false);
  const [authors, setAuthors] = useState<AuthorWithPostCount[]>([]);
  const [authorsLoading, setAuthorsLoading] = useState(true);

  useEffect(() => {
    const checkWidth = () => {
      setIsMobile(window.innerWidth < 380);
    };

    checkWidth(); // Initial check
    window.addEventListener('resize', checkWidth);

    return () => window.removeEventListener('resize', checkWidth);
  }, []);
  
  useEffect(() => {
    async function fetchAllAuthors() {
        if (!allPostsLoaded) return;
        
        try {
            setAuthorsLoading(true);
            const userList = await getAllUsers();
            
            const postCounts = new Map<string, number>();
            allPosts.forEach(post => {
                if (post.status === 'published') {
                    postCounts.set(post.author_id, (postCounts.get(post.author_id) || 0) + 1);
                }
            });

            const authorsWithCounts: AuthorWithPostCount[] = userList.map(user => ({
                ...user,
                postCount: postCounts.get(user.id) || 0
            }));
            
            setAuthors(authorsWithCounts.sort((a,b) => b.postCount - a.postCount));

        } catch (error) {
            console.error("Failed to fetch authors:", error);
        } finally {
            setAuthorsLoading(false);
        }
    }

    fetchAllAuthors();
  }, [allPostsLoaded, allPosts]);
  
  const paginatedAndFilteredPosts = useMemo(() => {
    // If not all posts are loaded yet, and we are not searching/sorting,
    // just show the initial posts that are available. This is crucial for interactivity.
    if (!allPostsLoaded && !searchTerm && sortOrder === 'newest') {
      return displayedPosts;
    }

    // From this point on, we assume allPosts are loaded for any search/sort operation
    let postsToProcess = [...allPosts];

    // 1. Sort the entire collection
    if (sortOrder === 'most_viewed') {
        postsToProcess.sort((a, b) => b.views - a.views);
    } else { // 'newest' is the default
        postsToProcess.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    // 2. Filter by search term (if any)
    if (searchTerm) {
        return postsToProcess.filter(post =>
            post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (post.author && post.author.name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }
    
    // 3. If not searching, return the currently displayed (paginated) posts
    // This ensures that "Load More" works as expected without being reset by the sort memo.
    // The `displayedPosts` from the context is already sorted and paginated.
    if (sortOrder === 'newest') {
        return displayedPosts;
    }

    // 4. For any other sort order, paginate the fully sorted list.
    return postsToProcess.slice(0, currentPage * postsPerPage);

  }, [searchTerm, sortOrder, allPosts, displayedPosts, allPostsLoaded, currentPage, postsPerPage]);
  
  const filteredAuthors = useMemo(() => {
    if (!searchTerm) return authors;
    return authors.filter(author => 
        author.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [authors, searchTerm]);

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

  // The "Load More" button should only show if we are not searching and there are more posts available.
  const hasMoreToLoad = !searchTerm && hasMore;

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
            <div className="flex items-center justify-between mb-6 gap-4">
                <TabsList className="grid w-full sm:w-auto grid-cols-2">
                    <TabsTrigger value="essays">{isMobile ? 'Insholar' : 'Barcha Insholar'}</TabsTrigger>
                    <TabsTrigger value="authors" disabled={!allPostsLoaded && authorsLoading}>
                        Mualliflar
                        {!allPostsLoaded && <Loader2 className="ml-2 h-4 w-4 animate-spin"/>}
                    </TabsTrigger>
                </TabsList>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <ListFilter className="h-4 w-4" />
                      <span>Saralash</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48" align="end">
                    <DropdownMenuRadioGroup value={sortOrder} onValueChange={(value) => setSortOrder(value as 'newest' | 'most_viewed')}>
                      <DropdownMenuRadioItem value="newest">Eng so'nggilari</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="most_viewed">Eng ko'p ko'rilganlar</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <TabsContent value="essays">
                 {postsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <EssayCardSkeleton key={index} />
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {paginatedAndFilteredPosts.map((post, index) => (
                            <div 
                                key={post.id} 
                                className={index < INITIAL_LOAD_COUNT ? "animate-fade-in-up" : ""}
                                style={{ 
                                  animationDelay: index < INITIAL_LOAD_COUNT ? `${index * 100}ms` : '0ms'
                                }}
                            >
                                <EssayCard post={post} />
                            </div>
                            ))}
                        </div>
                         {hasMoreToLoad && (
                            <div className="mt-12 text-center">
                                <Button onClick={loadMorePosts} disabled={!allPostsLoaded}>
                                    {allPostsLoaded ? 'Ko\'proq ko\'rish' : <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {allPostsLoaded ? '' : 'Yuklanmoqda...'}
                                </Button>
                            </div>
                        )}
                    </>
                )}
                 {!postsLoading && paginatedAndFilteredPosts.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-lg text-muted-foreground">
                            {searchTerm ? "Hech qanday natija topilmadi." : "Hozircha insholar mavjud emas."}
                        </p>
                    </div>
                 )}
            </TabsContent>
            <TabsContent value="authors">
                {authorsLoading ? (
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
                        {filteredAuthors.map((author, index) => (
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
