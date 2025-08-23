
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User, Post, Comment, Achievement } from '@/types';
import { getAllUsers, getUserById } from './users';
import { getPublishedPosts } from './posts';
import { BookUser, Eye, MessageSquare } from 'lucide-react';

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
        icon: <BookUser className="h-8 w-8" />,
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
            icon: <Eye className="h-8 w-8" />,
            holderId: null, holderName: null, holderAvatarUrl: null, value: '0 marta'
        };
    }
    
    const mostViewedPost = posts.sort((a,b) => b.views - a.views)[0];
    const author = mostViewedPost.author_id ? await getUserById(mostViewedPost.author_id) : null;

    return {
        id: 'most-views',
        title: 'Ommabop Fikr',
        description: `"${mostViewedPost.title}" nomli eng ko'p o'qilgan insho muallifi.`,
        icon: <Eye className="h-8 w-8" />,
        holderId: author?.id ?? null,
        holderName: author?.name ?? null,
        holderAvatarUrl: author?.avatar_url ?? null,
        value: `${mostViewedPost.views.toLocaleString()} marta ko'rilgan`,
    };
}


async function getMostCommentsWrittenHolder(): Promise<Achievement> {
    const commentsSnapshot = await getDocs(collection(db, 'comments'));
    const comments = commentsSnapshot.docs.map(doc => doc.data() as Comment);
    
    if (comments.length === 0) {
       return {
            id: 'most-comments',
            title: 'Faol Muhokamachi',
            description: "Eng ko'p sharh yozib, suhbatlarni jonlantirgan foydalanuvchi.",
            icon: <MessageSquare className="h-8 w-8" />,
            holderId: null, holderName: null, holderAvatarUrl: null, value: '0 sharh'
       };
    }

    const commentCounts: { [key: string]: number } = {};
    comments.forEach(comment => {
        commentCounts[comment.user_id] = (commentCounts[comment.user_id] || 0) + 1;
    });

    const winnerEntry = Object.entries(commentCounts).sort((a, b) => b[1] - a[1])[0];
    const winnerId = winnerEntry[0];
    const winnerCount = winnerEntry[1];
    const winner = await getUserById(winnerId);

    return {
        id: 'most-comments',
        title: 'Faol Muhokamachi',
        description: "Eng ko'p sharh yozib, suhbatlarni jonlantirgan foydalanuvchi.",
        icon: <MessageSquare className="h-8 w-8" />,
        holderId: winner?.id ?? null,
        holderName: winner?.name ?? null,
        holderAvatarUrl: winner?.avatar_url ?? null,
        value: `${winnerCount} sharh`,
    };
}


export async function getAchievements(): Promise<Achievement[]> {
    const [
        mostPostsHolder,
        mostViewsHolder,
        mostCommentsHolder
    ] = await Promise.all([
        getMostPostsWrittenHolder(),
        getMostViewedPostHolder(),
        getMostCommentsWrittenHolder()
    ]);
    
    return [mostPostsHolder, mostViewsHolder, mostCommentsHolder];
}
