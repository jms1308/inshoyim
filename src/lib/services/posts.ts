
'use server';

import { db } from '@/lib/firebase';
import { 
    collection, 
    getDocs, 
    query, 
    where, 
    doc, 
    getDoc, 
    updateDoc, 
    arrayUnion,
    increment,
    Timestamp,
    addDoc,
    orderBy,
    limit,
    deleteDoc,
    writeBatch,
    startAfter,
    QueryDocumentSnapshot,
    DocumentData
} from 'firebase/firestore';
import type { Post, Comment, Notification } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { getUserById } from './users';


const postsCollection = collection(db, 'posts');

// Function to convert Firestore timestamp to our Post type
const postFromDoc = (doc: QueryDocumentSnapshot<DocumentData> | DocumentData): Post => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        created_at: (data.created_at as Timestamp).toDate().toISOString(),
        updated_at: (data.updated_at as Timestamp).toDate().toISOString(),
        comments: data.comments || [], // Ensure comments is an array
    } as Post;
}

export async function getPublishedPosts(): Promise<Post[]> {
    const q = query(
        postsCollection, 
        where('status', '==', 'published'),
        orderBy('created_at', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(postFromDoc);
}


export async function getPostsByAuthor(authorId: string, includeDrafts: boolean = false): Promise<Post[]> {
  if (!authorId) return [];
  
  let postQuery;
  if (includeDrafts) {
    // Fetch all posts by author, regardless of status
    postQuery = query(postsCollection, 
      where('author_id', '==', authorId)
    );
  } else {
    // Fetch only published posts by author
    postQuery = query(postsCollection, 
      where('author_id', '==', authorId), 
      where('status', '==', 'published')
    );
  }
  
  const snapshot = await getDocs(postQuery);
  let posts = snapshot.docs.map(postFromDoc);

  // Sort posts by creation date in descending order
  posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return posts;
}


export async function getPostById(id: string): Promise<Post | null> {
    if (!id) return null;
    const postDoc = doc(db, 'posts', id);
    const snapshot = await getDoc(postDoc);

    if (snapshot.exists()) {
        return postFromDoc(snapshot);
    } else {
        return null;
    }
}

export async function incrementPostView(postId: string): Promise<void> {
    if (!postId) return;
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
        views: increment(1)
    });
}

export async function addCommentToPost(postId: string, userId: string, content: string, parentId: string | null = null): Promise<Comment> {
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);
    if (!postSnap.exists()) {
        throw new Error("Post not found");
    }
    const post = postFromDoc(postSnap);

    const newComment: Comment = {
        id: uuidv4(),
        post_id: postId,
        user_id: userId,
        content: content,
        created_at: new Date().toISOString(),
        parent_id: parentId,
    };

    await updateDoc(postRef, {
        comments: arrayUnion(newComment)
    });

    // --- Notification Logic ---
    const actor = await getUserById(userId);
    if (!actor) throw new Error("Actor not found");

    let notificationRecipientId: string | null = null;
    let notificationType: 'new_comment' | 'new_reply' = 'new_comment';

    if (parentId) {
        // It's a reply, find parent comment to notify its author
        const parentComment = post.comments.find(c => c.id === parentId);
        if (parentComment) { // Check if parent comment exists
            notificationRecipientId = parentComment.user_id;
            notificationType = 'new_reply';
        } else {
            console.warn(`Parent comment with ID ${parentId} not found. Skipping notification.`);
        }
    } else {
        // It's a new root comment, notify the post's author
        notificationRecipientId = post.author_id;
    }

    // Send notification if we have a recipient and they are not the actor
    if (notificationRecipientId && actor.id !== notificationRecipientId) {
        const userToNotifyRef = doc(db, 'users', notificationRecipientId);
        const notification: Notification = {
            id: uuidv4(),
            user_id: notificationRecipientId,
            type: notificationType,
            post_id: postId,
            post_title: post.title,
            comment_id: newComment.id,
            actor_id: actor.id,
            actor_name: actor.name,
            created_at: new Date().toISOString(),
            read: false,
        };
        await updateDoc(userToNotifyRef, {
            notifications: arrayUnion(notification)
        });
    }

    return newComment;
}


export async function deleteCommentFromPost(postId: string, commentId: string): Promise<void> {
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);

    if (postSnap.exists()) {
        const postData = postSnap.data();
        const comments = postData.comments || [];
        // This should also remove all replies to this comment, but for now, we just remove the comment itself.
        // A more robust solution would be to find all comments with parent_id === commentId and remove them too.
        const updatedComments = comments.filter((comment: Comment) => comment.id !== commentId);

        await updateDoc(postRef, {
            comments: updatedComments
        });
    } else {
        throw new Error("Post not found");
    }
}

function calculateReadTime(content: any): number {
    if (!content || !content.blocks) return 0;
    const textContent = content.blocks
        .filter((block: any) => block.type === 'paragraph' || block.type === 'header')
        .map((block: any) => block.data.text)
        .join(' ');
    
    const words = textContent.split(/\s+/).length;
    return Math.ceil(words / 200);
}

interface CreatePostData {
    title: string;
    content: any; // Editor.js content is an object
    author_id: string;
    tags: string[];
    status: 'published' | 'draft';
}

export async function createPost(data: CreatePostData): Promise<Post> {
    const readTime = calculateReadTime(data.content);

    const newPost = {
        ...data,
        created_at: new Date(),
        updated_at: new Date(),
        views: 0,
        read_time: readTime,
        comments: [],
        viewed_by: [],
    };

    const docRef = await addDoc(postsCollection, newPost);
    
    return {
        id: docRef.id,
        ...newPost,
        created_at: newPost.created_at.toISOString(),
        updated_at: newPost.updated_at.toISOString(),
    };
}


interface UpdatePostData {
    title: string;
    content: any; // Editor.js content is an object
    tags: string[];
    status: 'published' | 'draft';
}

export async function updatePost(postId: string, data: UpdatePostData): Promise<void> {
    const postRef = doc(db, 'posts', postId);
    const readTime = calculateReadTime(data.content);

    const updateData = {
        ...data,
        read_time: readTime,
        updated_at: new Date(),
    };

    await updateDoc(postRef, updateData);
}

export async function deletePost(postId: string): Promise<void> {
    const postRef = doc(db, 'posts', postId);
    await deleteDoc(postRef);
}
