
'use client';

import React, { createContext, useState, useEffect, ReactNode, useMemo, useContext } from 'react';
import { usePosts } from './PostContext';
import { getAllUsers } from '@/lib/services/users';
import type { User, Post } from '@/types';
import { Trophy, Flame } from 'lucide-react';

interface Achievement {
    type: 'most_posts' | 'most_views';
    title: string;
    description: string;
    icon: React.ReactNode;
}

interface AchievementContextType {
    mostPostsHolderIds: string[] | undefined;
    mostViewsHolderIds: {
        id: string;
        postTitle: string;
    }[] | undefined;
    loading: boolean;
}

const AchievementContext = createContext<AchievementContextType>({
    mostPostsHolderIds: [],
    mostViewsHolderIds: [],
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

    const mostPostsHolderIds = useMemo(() => {
        if (postsLoading || usersLoading || users.length === 0) return undefined;

        const postCounts = users.map(user => {
            const count = posts.filter(post => post.author_id === user.id && post.status === 'published').length;
            return { userId: user.id, count };
        });
        
        if (postCounts.length === 0) return [];
        
        const maxCount = Math.max(...postCounts.map(pc => pc.count));
        
        if (maxCount === 0) return [];

        return postCounts.filter(pc => pc.count === maxCount).map(pc => pc.userId);

    }, [posts, users, postsLoading, usersLoading]);

    const mostViewsHolderIds = useMemo(() => {
        if (postsLoading || posts.length === 0) return undefined;
        
        const publishedPosts = posts.filter(p => p.status === 'published');
        if (publishedPosts.length === 0) return [];

        const maxViews = Math.max(...publishedPosts.map(p => p.views));

        if (maxViews === 0) return [];

        return publishedPosts
            .filter(p => p.views === maxViews)
            .map(p => ({
                id: p.author_id,
                postTitle: p.title,
            }));
            
    }, [posts, postsLoading]);
    
    const value = {
        mostPostsHolderIds,
        mostViewsHolderIds,
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

    const { mostPostsHolderIds, mostViewsHolderIds, loading } = context;

    const achievements = useMemo(() => {
        if (loading || !userId) return [];
        
        const userAchievements: Achievement[] = [];
        
        if (mostPostsHolderIds && mostPostsHolderIds.includes(userId)) {
            userAchievements.push({
                type: 'most_posts',
                title: 'Sermahsul Ijodkor',
                description: 'Eng ko\'p insho yozgan foydalanuvchi.',
                icon: <Trophy className="h-full w-full" />
            });
        }
        
        const mostViewsAchievements = mostViewsHolderIds?.filter(holder => holder.id === userId);
        if (mostViewsAchievements && mostViewsAchievements.length > 0) {
           mostViewsAchievements.forEach(ach => {
             userAchievements.push({
                type: 'most_views',
                title: 'Ommabop Fikr',
                description: `"${ach.postTitle}" nomli eng mashhur insho muallifi.`,
                icon: <Flame className="h-full w-full" />
            });
           })
        }

        return userAchievements;

    }, [userId, mostPostsHolderIds, mostViewsHolderIds, loading]);

    return { ...context, achievements };
}
