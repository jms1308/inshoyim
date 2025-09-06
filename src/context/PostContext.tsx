
'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { getPublishedPosts } from '@/lib/services/posts';
import { getUserById, getAllUsers } from '@/lib/services/users';
import type { Post, User } from '@/types';
import { DocumentData } from 'firebase/firestore';

interface PostContextType {
  posts: Post[]; // Currently displayed posts
  allPosts: Post[]; // All posts loaded in the background
  loading: boolean;
  allPostsLoaded: boolean;
  hasMore: boolean;
  refetchPosts: () => Promise<void>;
  loadMorePosts: () => void; // No longer async, no promise needed
}

const PostContext = createContext<PostContextType | undefined>(undefined);

const POSTS_PER_PAGE = 9;

export function PostsProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [allPostsLoaded, setAllPostsLoaded] = useState(false);
  const [page, setPage] = useState(1);

  const hasMore = posts.length < allPosts.length;
  
  // Attaches author data to posts
  const attachAuthorsToPosts = async (postsToProcess: Post[]): Promise<Post[]> => {
      const authorIds = [...new Set(postsToProcess.map(p => p.author_id))];
      if (authorIds.length === 0) return postsToProcess;
      
      const authorPromises = authorIds.map(id => getUserById(id));
      const authors = (await Promise.all(authorPromises)).filter((u): u is User => u !== null);
      const authorMap = new Map(authors.map(u => [u.id, u]));

      return postsToProcess.map(post => ({
        ...post,
        author: authorMap.get(post.author_id),
      }));
  }

  // Fetches initial 9 posts for quick display
  const fetchInitialPosts = useCallback(async () => {
    setLoading(true);
    try {
      const { posts: initialPosts } = await getPublishedPosts(POSTS_PER_PAGE);
      const postsWithAuthors = await attachAuthorsToPosts(initialPosts);
      setPosts(postsWithAuthors);
      setPage(1);
    } catch (error) {
      console.error("Error fetching initial posts:", error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Fetches ALL posts in the background
  const fetchAllPostsInBackground = useCallback(async () => {
    try {
        const { posts: fetchedAllPosts } = await getPublishedPosts(undefined, false); // No limit, no pagination
        const postsWithAuthors = await attachAuthorsToPosts(fetchedAllPosts);
        setAllPosts(postsWithAuthors);
    } catch (error) {
        console.error("Error fetching all posts for cache:", error);
    } finally {
        setAllPostsLoaded(true);
    }
  }, []);

  // Initial load effect
  useEffect(() => {
    fetchInitialPosts();
    fetchAllPostsInBackground();
  }, [fetchInitialPosts, fetchAllPostsInBackground]);

  const loadMorePosts = () => {
    if (!allPostsLoaded || !hasMore) return;
    
    const nextPage = page + 1;
    const newPosts = allPosts.slice(0, nextPage * POSTS_PER_PAGE);
    
    setPosts(newPosts);
    setPage(nextPage);
  };
  
  const refetchPosts = async () => {
      await fetchInitialPosts();
      await fetchAllPostsInBackground();
  };

  const value = {
    posts,
    allPosts,
    loading,
    isFetchingMore: false, // This is instant now
    allPostsLoaded,
    hasMore,
    refetchPosts,
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
