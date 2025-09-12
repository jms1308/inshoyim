
'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { getPublishedPosts } from '@/lib/services/posts';
import { getUserById } from '@/lib/services/users';
import type { Post, User } from '@/types';
import { DocumentData } from 'firebase/firestore';

const POSTS_PER_PAGE = 9;

interface PostContextType {
  posts: Post[]; // Renamed from displayedPosts to posts for simplicity
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
  const [posts, setPosts] = useState<Post[]>([]);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [allPostsLoaded, setAllPostsLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const attachAuthorsToPosts = useCallback(async (postsToProcess: Post[]): Promise<Post[]> => {
    const authorIds = [...new Set(postsToProcess.map(p => p.author_id))];
    if (authorIds.length === 0) return postsToProcess;

    const authorPromises = authorIds.map(id => getUserById(id));
    const authors = (await Promise.all(authorPromises)).filter((u): u is User => u !== null);
    const authorMap = new Map(authors.map(u => [u.id, u]));

    return postsToProcess.map(post => ({
      ...post,
      author: authorMap.get(post.author_id),
    }));
  }, []);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setAllPostsLoaded(false);
    setPosts([]);
    setAllPosts([]);
    setCurrentPage(1);

    try {
      // 1. Fetch initial posts for immediate display
      const { posts: initialPostsResult } = await getPublishedPosts(POSTS_PER_PAGE, true);
      const initialPostsWithAuthors = await attachAuthorsToPosts(initialPostsResult);
      setPosts(initialPostsWithAuthors);
      setLoading(false);

      // 2. Fetch all posts in the background for searching, sorting, and pagination
      const { posts: allFetchedPosts } = await getPublishedPosts(undefined, false); // No limit, no pagination
      const allPostsWithAuthors = await attachAuthorsToPosts(allFetchedPosts);
      
      // Sort all posts by creation date by default
      const sortedAllPosts = allPostsWithAuthors.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setAllPosts(sortedAllPosts);
      setAllPostsLoaded(true);

    } catch (error) {
      console.error("Error fetching posts:", error);
      setLoading(false);
      setAllPostsLoaded(true); // Stop loading indicators on error
    }
  }, [attachAuthorsToPosts]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const loadMorePosts = () => {
     if (!allPostsLoaded) return;
     const nextPage = currentPage + 1;
     const newPosts = allPosts.slice(0, nextPage * POSTS_PER_PAGE);
     setPosts(newPosts);
     setCurrentPage(nextPage);
  };

  const refetchPosts = async () => {
    await fetchPosts();
  };
  
  const hasMore = allPostsLoaded && posts.length < allPosts.length;

  const value = {
    posts,
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
