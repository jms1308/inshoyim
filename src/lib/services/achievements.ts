

import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User, Post, Comment, Achievement } from '@/types';
import { getAllUsers, getUserById } from './users';
import { getPublishedPosts } from './posts';

async function getMostPostsWrittenHolder(): Promise<Achievement> {
    const users = await getAllUsers();
    const posts = await getPublishedPosts();

    const postCounts = users.map(user => {
        const count = posts.filter(post => post.author_id === user.id).length;
        return { user, count };
    });

    const winner = postCounts.sort((a, b) => b.count - a.count)[0];
    
    return {
        id: 'most-posts',
        title: 'Sermahsul Ijodkor',
        description: "Eng ko'p insho yozgan va o'z fikrlari bilan bo'lishgan foydalanuvchi.",
        icon: 'BookUser',
        holderId: winner?.user.id ?? null,
        holderName: winner?.user.name ?? null,
        holderAvatarUrl: winner?.user.avatar_url ?? null,
        value: `${winner?.count ?? 0} insho`,
    };
}


async function getMostViewedPostHolder(): Promise<Achievement> {
    const posts = await getPublishedPosts();
    if (posts.length === 0) {
        return {
            id: 'most-views',
            title: 'Ommabop Fikr',
            description: "Eng ko'p marta o'qilgan insho muallifi.",
            icon: 'Eye',
            holderId: null, holderName: null, holderAvatarUrl: null, value: '0 marta'
        };
    }
    
    const mostViewedPost = posts.sort((a,b) => b.views - a.views)[0];
    const author = mostViewedPost.author_id ? await getUserById(mostViewedPost.author_id) : null;

    return {
        id: 'most-views',
        title: 'Ommabop Fikr',
        description: `"${mostViewedPost.title}" nomli eng ko'p o'qilgan insho muallifi.`,
        icon: 'Eye',
        holderId: author?.id ?? null,
        holderName: author?.name ?? null,
        holderAvatarUrl: author?.avatar_url ?? null,
        value: `${mostViewedPost.views.toLocaleString()} marta ko'rilgan`,
    };
}


export async function getAchievements(): Promise<Achievement[]> {
    const [
        mostPostsHolder,
        mostViewsHolder,
    ] = await Promise.all([
        getMostPostsWrittenHolder(),
        getMostViewedPostHolder(),
    ]);
    
    return [mostPostsHolder, mostViewsHolder];
}
