
'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { getPublishedPosts } from '@/lib/services/posts';
import { getUserById, getAllUsers } from '@/lib/services/users';
import type { Post, User } from '@/types';
import { DocumentData } from 'firebase/firestore';

const POSTS_PER_PAGE = 9;

interface PostContextType {
  posts: Post[]; // The posts currently displayed on the page (paginated)
  allPosts: Post[]; // All published posts for searching/sorting
  loading: boolean; // Only true for the initial load of the first page
  allPostsLoaded: boolean; // True when all posts have been fetched in the background
  hasMore: boolean; // True if there are more posts to load via pagination
  refetchPosts: () => Promise<void>;
  loadMorePosts: () => void;
  currentPage: number;
  postsPerPage: number;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

const attachAuthorsToPosts = async (postsToProcess: Post[]): Promise<Post[]> => {
    // Avoid fetching if there are no posts
    if (postsToProcess.length === 0) return [];
    
    // Get unique author IDs that don't already have author data attached
    const authorIds = [...new Set(postsToProcess.filter(p => p.author_id && !p.author).map(p => p.author_id))];
    if (authorIds.length === 0) return postsToProcess;

    // Fetch all unique users in one go
    const allUsers = await getAllUsers();
    const authorMap = new Map(allUsers.map(u => [u.id, u]));

    // Attach author data to each post
    return postsToProcess.map(post => {
      if (post.author) return post; // Don't re-attach if already present
      return {
        ...post,
        author: authorMap.get(post.author_id),
      }
    });
};


export function PostsProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [allPostsLoaded, setAllPostsLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastVisible, setLastVisible] = useState<DocumentData | null>(null);

  // Function to fetch the first page of posts
  const fetchInitialPosts = useCallback(async () => {
    setLoading(true);
    try {
      const { posts: initialPostsResult, lastVisible: newLastVisible } = await getPublishedPosts(true, POSTS_PER_PAGE, null);
      const initialPostsWithAuthors = await attachAuthorsToPosts(initialPostsResult);
      
      setPosts(initialPostsWithAuthors);
      setLastVisible(newLastVisible);
      setCurrentPage(1);

    } catch (error) {
      console.error("Error fetching initial posts:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to fetch all remaining posts in the background
  const fetchAllPostsInBackground = useCallback(async () => {
    try {
      // Fetch all posts without pagination
      const { posts: allFetchedPosts } = await getPublishedPosts(false);
      const allPostsWithAuthors = await attachAuthorsToPosts(allFetchedPosts);
      
      // Sort all posts by creation date by default
      const sortedAllPosts = allPostsWithAuthors.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setAllPosts(sortedAllPosts);
    } catch (error) {
      console.error("Error fetching all posts in background:", error);
    } finally {
        setAllPostsLoaded(true); // Mark as loaded even if there's an error
    }
  }, []);


  // Main effect to orchestrate fetching
  useEffect(() => {
    fetchInitialPosts();
    fetchAllPostsInBackground();
  }, [fetchInitialPosts, fetchAllPostsInBackground]);


  const loadMorePosts = () => {
     if (!allPostsLoaded) return; // Should not happen, but as a safeguard
     const nextPage = currentPage + 1;
     const newPosts = allPosts.slice(0, nextPage * POSTS_PER_PAGE);
     setPosts(newPosts);
     setCurrentPage(nextPage);
  };

  const refetchPosts = async () => {
    // This function can be expanded later if server-side filtering is needed
    // For now, it just re-runs the initial fetch logic
    setAllPostsLoaded(false);
    await fetchInitialPosts();
    await fetchAllPostsInBackground();
  };
  
  // Determines if the "Load More" button should be shown
  const hasMore = allPostsLoaded && posts.length < allPosts.length;

  const value = {
    posts: posts,
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
