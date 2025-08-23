
'use client';

import React, { createContext, useState, useEffect, ReactNode, useMemo, useContext } from 'react';
import { usePosts } from './PostContext';
import { getAllUsers } from '@/lib/services/users';
import type { User, Post } from '@/types';

interface AchievementContextType {
    mostPostsHolderId: string | null;
    mostViewsHolder: {
        id: string | null;
        postTitle: string | null;
    };
    loading: boolean;
}

const AchievementContext = createContext<AchievementContextType>({
    mostPostsHolderId: null,
    mostViewsHolder: { id: null, postTitle: null },
    loading: true,
});

export function AchievementProvider({ children }: { children: ReactNode }) {
    const { posts, loading: postsLoading } = usePosts();
    const [users, setUsers] = useState<User[]>([]);
    const [usersLoading, setUsersLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const allUsers = await getAllUsers();
                setUsers(allUsers);
            } catch (error) {
                console.error("Failed to fetch users for achievements:", error);
            } finally {
                setUsersLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const mostPostsHolderId = useMemo(() => {
        if (postsLoading || usersLoading || users.length === 0 || posts.length === 0) return null;

        const postCounts = users.map(user => {
            const count = posts.filter(post => post.author_id === user.id && post.status === 'published').length;
            return { userId: user.id, count };
        });

        if (postCounts.every(pc => pc.count === 0)) return null;

        const winner = postCounts.sort((a, b) => b.count - a.count)[0];
        return winner.count > 0 ? winner.userId : null;
    }, [posts, users, postsLoading, usersLoading]);

    const mostViewsHolder = useMemo(() => {
        if (postsLoading || posts.length === 0) return { id: null, postTitle: null };

        const mostViewedPost = posts.filter(p => p.status === 'published').sort((a, b) => b.views - a.views)[0];
        
        if (!mostViewedPost || mostViewedPost.views === 0) return { id: null, postTitle: null };
        
        return {
            id: mostViewedPost.author_id,
            postTitle: mostViewedPost.title,
        };
    }, [posts, postsLoading]);
    
    const value = {
        mostPostsHolderId,
        mostViewsHolder,
        loading: postsLoading || usersLoading,
    };

    return (
        <AchievementContext.Provider value={value}>
            {children}
        </AchievementContext.Provider>
    );
}

export function useAchievement(userId?: string) {
    const context = useContext(AchievementContext);
    if (context === undefined) {
        throw new Error('useAchievement must be used within an AchievementProvider');
    }

    const { mostPostsHolderId, mostViewsHolder, loading } = context;

    const achievements = useMemo(() => {
        if (loading || !userId) return [];
        
        const userAchievements = [];
        if (userId === mostPostsHolderId) {
            userAchievements.push({
                type: 'most_posts',
                title: 'Sermahsul Ijodkor',
                description: 'Eng ko\'p insho yozgan foydalanuvchi.',
            });
        }
        if (userId === mostViewsHolder.id) {
            userAchievements.push({
                type: 'most_views',
                title: 'Ommabop Fikr',
                description: `"${mostViewsHolder.postTitle}" nomli eng mashhur insho muallifi.`,
            });
        }
        return userAchievements;

    }, [userId, mostPostsHolderId, mostViewsHolder, loading]);

    return { achievements, loading };
}
