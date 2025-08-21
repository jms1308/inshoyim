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
import type { Post, Comment } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const postsCollection = collection(db, 'posts');
const commentsCollection = collection(db, 'comments');

const postFromDocData = (id: string, data: DocumentData): Post => {
    return {
        id: id,
        ...data,
        created_at: (data.created_at as Timestamp).toDate().toISOString(),
        updated_at: (data.updated_at as Timestamp).toDate().toISOString(),
    } as Post;
}

export async function getPublishedPosts(): Promise<Post[]> {
    const q = query(
        postsCollection, 
        where('status', '==', 'published'),
        orderBy('created_at', 'desc')
    );
    const snapshot = await getDocs(q);
    const posts = snapshot.docs.map(doc => postFromDocData(doc.id, doc.data()));
    return posts;
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

const commentFromDocData = (id: string, data: DocumentData): Comment => {
    return {
        id: id,
        ...data,
        created_at: (data.created_at as Timestamp).toDate().toISOString(),
    } as Comment;
}

export async function getCommentsByPostId(postId: string): Promise<Comment[]> {
    if (!postId) return [];
    const q = query(commentsCollection, where('post_id', '==', postId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => commentFromDocData(doc.id, doc.data()));
}


export async function addCommentToPost(postId: string, userId: string, content: string, parentId: string | null = null): Promise<Comment> {
    const newComment = {
        id: uuidv4(), // We assign a client-side ID to avoid a second read
        post_id: postId,
        user_id: userId,
        content: content,
        created_at: new Date(),
        parent_id: parentId,
    };
    
    // We use the client-side ID for the document ID as well for consistency
    const commentRef = doc(db, "comments", newComment.id);
    await addDoc(commentsCollection, newComment);

    return {
      ...newComment,
      created_at: newComment.created_at.toISOString(),
    };
}


export async function deleteCommentFromPost(commentId: string): Promise<void> {
    const commentRef = doc(db, 'comments', commentId);
    await deleteDoc(commentRef);
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

    await updateDoc(postRef, updateData);
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
    
