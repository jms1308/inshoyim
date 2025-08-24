
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
    deleteDoc,
    arrayRemove
} from 'firebase/firestore';
import type { Post, Comment, User } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { getUserById } from './users';

const postsCollection = collection(db, 'posts');

const postFromDocData = (id: string, data: DocumentData): Post => {
    const postData = {
        id: id,
        ...data,
        created_at: (data.created_at as Timestamp).toDate().toISOString(),
        updated_at: (data.updated_at as Timestamp).toDate().toISOString(),
    } as Post;
    // Ensure comments array exists
    if (!postData.comments) {
        postData.comments = [];
    }
    return postData;
}

export async function getPublishedPosts(): Promise<Post[]> {
    const q = query(
        postsCollection, 
        where('status', '==', 'published'),
        orderBy('created_at', 'desc')
    );
    const snapshot = await getDocs(q);
    const postsData = snapshot.docs.map(doc => postFromDocData(doc.id, doc.data()));

    // Efficiently fetch all unique authors
    const authorIds = [...new Set(postsData.map(p => p.author_id))];
    const authorPromises = authorIds.map(id => getUserById(id));
    const authors = (await Promise.all(authorPromises)).filter((u): u is User => u !== null);
    const authorMap = new Map(authors.map(u => [u.id, u]));

    // Attach author to each post and calculate comment count
    const postsWithAuthors = postsData.map(post => ({
        ...post,
        author: authorMap.get(post.author_id),
    }));
    
    return postsWithAuthors;
}


export async function getPostsByAuthor(authorId: string, includeDrafts: boolean = false): Promise<Post[]> {
  if (!authorId) return [];
  
  let postQuery;
  if (includeDrafts) {
    postQuery = query(postsCollection, 
      where('author_id', '==', authorId)
    );
  } else {
    postQuery = query(postsCollection, 
      where('author_id', '==', authorId), 
      where('status', '==', 'published')
    );
  }
  
  const snapshot = await getDocs(postQuery);
  let posts = snapshot.docs.map(doc => postFromDocData(doc.id, doc.data()));
  posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return posts;
}

export async function getPostById(id: string): Promise<Post | null> {
    if (!id) return null;
    const postDoc = doc(db, 'posts', id);
    const snapshot = await getDoc(postDoc);

    if (snapshot.exists()) {
        const data = snapshot.data();
        return postFromDocData(snapshot.id, data);
    } else {
        return null;
    }
}


// ========= COMMENT SERVICE FUNCTIONS =========

export async function addCommentToPost(postId: string, userId: string, content: string, parentId: string | null = null): Promise<Comment> {
    const postRef = doc(db, 'posts', postId);
    
    const newComment: Comment = {
        id: uuidv4(),
        user_id: userId,
        content: content,
        created_at: new Date().toISOString(),
        parent_id: parentId,
    };
    
    await updateDoc(postRef, {
        comments: arrayUnion(newComment)
    });
    
    return newComment;
}

export async function deleteCommentFromPost(postId: string, commentId: string): Promise<void> {
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);

    if (!postSnap.exists()) {
        throw new Error("Post not found");
    }

    const postData = postSnap.data() as Post;
    const commentToDelete = postData.comments?.find(c => c.id === commentId);

    if (commentToDelete) {
        await updateDoc(postRef, {
            comments: arrayRemove(commentToDelete)
        });
    } else {
        console.warn("Comment not found in post, could not delete.");
    }
}


// ========= POST MUTATION FUNCTIONS =========

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
    content: any;
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
        comments: [], // Initialize with empty comments array
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
    content: any;
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

    await updateDoc(postRef, updateData as any);
}

export async function deletePost(postId: string): Promise<void> {
    const postRef = doc(db, 'posts', postId);
    await deleteDoc(postRef);
}

export async function incrementPostView(postId: string): Promise<void> {
    if (!postId) return;
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
        views: increment(1)
    });
}
