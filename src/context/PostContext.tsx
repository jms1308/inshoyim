
'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { getPublishedPosts } from '@/lib/services/posts';
import { getUserById } from '@/lib/services/users';
import type { Post, User } from '@/types';
import { DocumentData } from 'firebase/firestore';

const POSTS_PER_PAGE = 9;

interface PostContextType {
  posts: Post[];
  allPosts: Post[];
  loading: boolean;
  allPostsLoaded: boolean;
  hasMore: boolean;
  refetchPosts: () => Promise<void>;
  loadMorePosts: () => void;
  currentPage: number;
  postsPerPage: number;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export function PostsProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]); // Initially displayed posts
  const [allPosts, setAllPosts] = useState<Post[]>([]); // All posts cached
  const [loading, setLoading] = useState(true);
  const [allPostsLoaded, setAllPostsLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Helper to attach author data to posts
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
  };

  // Fetches initial posts for quick display and all posts for background cache
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setAllPostsLoaded(false);

    try {
      // Fetch initial posts
      const { posts: initialPosts } = await getPublishedPosts(POSTS_PER_PAGE, true);
      const initialPostsWithAuthors = await attachAuthorsToPosts(initialPosts);
      setPosts(initialPostsWithAuthors);
      setCurrentPage(1);
      setLoading(false);

      // Fetch all posts in the background
      const { posts: allFetchedPosts } = await getPublishedPosts(undefined, false); // No limit, no pagination
      const allPostsWithAuthors = await attachAuthorsToPosts(allFetchedPosts);
      setAllPosts(allPostsWithAuthors);
      setAllPostsLoaded(true);

    } catch (error) {
      console.error("Error fetching posts:", error);
      setPosts([]);
      setAllPosts([]);
      setLoading(false);
      setAllPostsLoaded(true); // Stop loading indicators on error
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const loadMorePosts = () => {
    if (!allPostsLoaded) return;
    setCurrentPage(prevPage => prevPage + 1);
  };

  const refetchPosts = async () => {
    await fetchPosts();
  };

  const hasMore = allPostsLoaded && (currentPage * POSTS_PER_PAGE < allPosts.length);

  const value = {
    posts: posts, // This will be replaced by the paginated slice in the component
    allPosts,
    loading,
    allPostsLoaded,
    hasMore,
    refetchPosts,
    loadMorePosts,
    currentPage,
    postsPerPage: POSTS_PER_PAGE,
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
