
'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { getPublishedPosts } from '@/lib/services/posts';
import type { Post } from '@/types';

interface PostContextType {
  posts: Post[];
  loading: boolean;
  refetchPosts: () => Promise<void>;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export function PostsProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedPosts = await getPublishedPosts();
      setPosts(fetchedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch posts only once when the provider mounts
    if (posts.length === 0) {
      fetchPosts();
    }
  }, [fetchPosts, posts.length]);
  
  const value = {
    posts,
    loading,
    refetchPosts: fetchPosts, // Expose a refetch function
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
