
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
    writeBatch
} from 'firebase/firestore';
import type { Post, Comment } from '@/types';
import { v4 as uuidv4 } from 'uuid';


const postsCollection = collection(db, 'posts');

// Function to convert Firestore timestamp to our Post type
const postFromDoc = (doc: any): Post => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        created_at: (data.created_at as Timestamp).toDate().toISOString(),
        updated_at: (data.updated_at as Timestamp).toDate().toISOString(),
        comments: data.comments || [], // Ensure comments is an array
    } as Post;
}

export async function getPublishedPosts(postLimit?: number): Promise<Post[]> {
    const q = query(postsCollection, where('status', '==', 'published'));
    const snapshot = await getDocs(q);
    
    let posts = snapshot.docs.map(postFromDoc);

    // Sort posts by creation date in descending order (newest first)
    posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    if (postLimit) {
        return posts.slice(0, postLimit);
    }
    
    return posts;
}

export async function getPostsByAuthor(authorId: string): Promise<Post[]> {
  if (!authorId) return [];
  const q = query(postsCollection, 
    where('author_id', '==', authorId), 
    where('status', '==', 'published')
  );
  
  const snapshot = await getDocs(q);
  
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

export async function addCommentToPost(postId: string, userId: string, content: string): Promise<Comment> {
    const postRef = doc(db, 'posts', postId);
    
    const newComment: Comment = {
        id: uuidv4(), // Generate a unique ID for the comment
        post_id: postId,
        user_id: userId,
        content: content,
        created_at: new Date().toISOString(),
    };

    await updateDoc(postRef, {
        comments: arrayUnion(newComment)
    });

    return newComment;
}

export async function deleteCommentFromPost(postId: string, commentId: string): Promise<void> {
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);

    if (postSnap.exists()) {
        const postData = postSnap.data();
        const comments = postData.comments || [];
        const updatedComments = comments.filter((comment: Comment) => comment.id !== commentId);

        await updateDoc(postRef, {
            comments: updatedComments
        });
    } else {
        throw new Error("Post not found");
    }
}


interface CreatePostData {
    title: string;
    content: string;
    author_id: string;
    tags: string[];
}

export async function createPost(data: CreatePostData): Promise<Post> {
    const readTime = Math.ceil(data.content.split(' ').length / 200);

    const newPost = {
        ...data,
        created_at: new Date(),
        updated_at: new Date(),
        views: 0,
        status: 'published' as const,
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
    content: string;
    tags: string[];
}

export async function updatePost(postId: string, data: UpdatePostData): Promise<void> {
    const postRef = doc(db, 'posts', postId);
    const readTime = Math.ceil(data.content.split(' ').length / 200);

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
