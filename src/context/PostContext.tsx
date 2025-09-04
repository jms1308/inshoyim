
'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { getPublishedPosts } from '@/lib/services/posts';
import { getUserById } from '@/lib/services/users';
import type { Post, User } from '@/types';
import { DocumentData } from 'firebase/firestore';

interface PostContextType {
  posts: Post[]; // Initially displayed posts
  allPosts: Post[]; // All posts loaded in the background
  loading: boolean;
  isFetchingMore: boolean;
  allPostsLoaded: boolean;
  hasMore: boolean;
  refetchPosts: () => Promise<void>;
  loadMorePosts: () => Promise<void>;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

const POSTS_PER_PAGE = 9;
const ALL_POSTS_CACHE_KEY = 'all_posts_cache';
const CACHE_EXPIRATION_MS = 10 * 60 * 1000; // 10 minutes

interface CachedPosts {
    timestamp: number;
    posts: Post[];
}

export function PostsProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [allPostsLoaded, setAllPostsLoaded] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisible, setLastVisible] = useState<DocumentData | null>(null);

  const fetchAndCacheAllPosts = useCallback(async () => {
    try {
      // Fetch all posts without pagination for caching
      const { posts: fetchedAllPosts } = await getPublishedPosts(undefined, false); // No limit
       
      const authorIds = [...new Set(fetchedAllPosts.map(p => p.author_id))];
      const authorPromises = authorIds.map(id => getUserById(id));
      const authors = (await Promise.all(authorPromises)).filter((u): u is User => u !== null);
      const authorMap = new Map(authors.map(u => [u.id, u]));

      const postsWithAuthors = fetchedAllPosts.map(post => ({
        ...post,
        author: authorMap.get(post.author_id),
      }));

      setAllPosts(postsWithAuthors);
      
      // Cache the result in localStorage
      const cacheData: CachedPosts = {
          timestamp: Date.now(),
          posts: postsWithAuthors
      };
      localStorage.setItem(ALL_POSTS_CACHE_KEY, JSON.stringify(cacheData));

    } catch (error) {
      console.error("Error fetching all posts for cache:", error);
    } finally {
      setAllPostsLoaded(true);
    }
  }, []);

  const fetchInitialPosts = useCallback(async () => {
    setLoading(true);
    try {
      const { posts: initialPosts, lastVisible: newLastVisible } = await getPublishedPosts(POSTS_PER_PAGE);

      const authorIds = [...new Set(initialPosts.map(p => p.author_id))];
      const authorPromises = authorIds.map(id => getUserById(id));
      const authors = (await Promise.all(authorPromises)).filter((u): u is User => u !== null);
      const authorMap = new Map(authors.map(u => [u.id, u]));

      const postsWithAuthors = initialPosts.map(post => ({
        ...post,
        author: authorMap.get(post.author_id),
      }));

      setPosts(postsWithAuthors);
      setLastVisible(newLastVisible);
      setHasMore(initialPosts.length === POSTS_PER_PAGE);
    } catch (error) {
      console.error("Error fetching initial posts:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Try to load all posts from cache first
    const cachedData = localStorage.getItem(ALL_POSTS_CACHE_KEY);
    if (cachedData) {
        const { timestamp, posts: cachedPosts }: CachedPosts = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_EXPIRATION_MS) {
            setAllPosts(cachedPosts);
            setAllPostsLoaded(true);
        }
    }

    fetchInitialPosts().then(() => {
      // After initial posts are fetched, start fetching all others in the background
      // if they weren't loaded from cache
      if (!allPostsLoaded) {
          fetchAndCacheAllPosts();
      }
    });
  }, [fetchInitialPosts, fetchAndCacheAllPosts, allPostsLoaded]);

  const loadMorePosts = useCallback(async () => {
    if (isFetchingMore || !hasMore) return;
    
    setIsFetchingMore(true);
    try {
      const { posts: newPosts, lastVisible: newLastVisible } = await getPublishedPosts(POSTS_PER_PAGE, true, lastVisible);

      const authorIds = [...new Set(newPosts.map(p => p.author_id))];
      const authorPromises = authorIds.map(id => getUserById(id));
      const authors = (await Promise.all(authorPromises)).filter((u): u is User => u !== null);
      const authorMap = new Map(authors.map(u => [u.id, u]));
      
      const postsWithAuthors = newPosts.map(post => ({
        ...post,
        author: authorMap.get(post.author_id),
      }));

      setPosts(prevPosts => [...prevPosts, ...postsWithAuthors]);
      setLastVisible(newLastVisible);
      setHasMore(newPosts.length === POSTS_PER_PAGE);

    } catch (error) {
      console.error("Error fetching more posts:", error);
    } finally {
      setIsFetchingMore(false);
    }
  }, [isFetchingMore, hasMore, lastVisible]);
  
  const value = {
    posts,
    allPosts,
    loading,
    isFetchingMore,
    allPostsLoaded,
    hasMore,
    refetchPosts: fetchInitialPosts,
    loadMorePosts,
  };

  return (
    <PostContext.Provider value={value}>
      {children}
    </PostContext.Provider>
  );
}

export function usePosts() {
  const context = useContext(PostContext);
  if (context === undefined) {
    throw new Error('usePosts must be used within a PostsProvider');
  }
  return context;
}
