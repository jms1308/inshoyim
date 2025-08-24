
'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { getPublishedPosts } from '@/lib/services/posts';
import { getUserById } from '@/lib/services/users';
import type { Post, User } from '@/types';

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
      
      // Get unique author IDs
      const authorIds = [...new Set(fetchedPosts.map(p => p.author_id))];
      
      // Fetch all authors in parallel
      const authorPromises = authorIds.map(id => getUserById(id));
      const authors = (await Promise.all(authorPromises)).filter((u): u is User => u !== null);
      
      // Create a map for quick lookup
      const authorMap = new Map<string, User>();
      authors.forEach(author => {
        if (author) {
          authorMap.set(author.id, author);
        }
      });
      
      // Attach author to each post
      const postsWithAuthors = fetchedPosts.map(post => ({
        ...post,
        author: authorMap.get(post.author_id),
      }));

      setPosts(postsWithAuthors);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);
  
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
