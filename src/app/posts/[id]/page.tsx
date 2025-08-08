
'use client';

import { useParams, notFound, useRouter } from 'next/navigation';
import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { getPostById, incrementPostView, addCommentToPost } from '@/lib/services/posts';
import { getUserById } from '@/lib/services/users';
import type { Post, User, Comment } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Eye, MessageSquare, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { ShareButton } from '@/components/ShareButton';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import { DeletePostDialog } from '@/components/DeletePostDialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

function CommentSection({ postId, initialComments, onCommentAdded }: { postId: string, initialComments: Comment[], onCommentAdded: (comment: (Comment & { author: User | null })) => void }) {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentsWithAuthors, setCommentsWithAuthors] = useState<(Comment & { author: User | null })[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchAuthors() {
      const commentsData = await Promise.all(
        initialComments.map(async (comment) => {
          const author = await getUserById(comment.user_id);
          return { ...comment, author };
        })
      );
      setCommentsWithAuthors(commentsData);
    }
    if (initialComments) {
      fetchAuthors();
    }
  }, [initialComments]);


  const handleSubmitComment = async () => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
        toast({ title: "Xatolik", description: "Izoh qoldirish uchun tizimga kiring.", variant: "destructive"});
        return;
    }
    const user = JSON.parse(storedUser);
    const userId = user.id;

    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const addedComment = await addCommentToPost(postId, userId, newComment);
      const author = await getUserById(userId);
      const newCommentWithAuthor = { ...addedComment, author };

      onCommentAdded(newCommentWithAuthor); // Update parent state
      setCommentsWithAuthors(prev => [...prev, newCommentWithAuthor]); // Update local state
      
      setNewComment("");
       toast({
        title: "Izohingiz qo'shildi!",
        description: "Fikringiz uchun rahmat.",
      });
    } catch (error) {
      console.error("Failed to add comment:", error);
      toast({
        title: "Xatolik!",
        description: "Izoh qo'shishda xatolik yuz berdi.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-12 pt-8 border-t">
      <h2 className="font-headline text-2xl font-bold mb-6">Sharhlar ({commentsWithAuthors?.length || 0})</h2>
      <div className="space-y-6">
        {commentsWithAuthors.map((comment, index) => (
          <div key={`${comment.id}-${index}`} className="flex gap-4">
             <Avatar>
                <AvatarImage src={comment.author?.avatar_url} alt={comment.author?.name} data-ai-hint="avatar" />
                <AvatarFallback>{comment.author?.name.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold">{comment.author?.name}</p>
              <p className="text-sm text-muted-foreground mb-1">
                 {format(new Date(comment.created_at), 'dd.MM.yyyy')}
              </p>
              <p>{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
       <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Fikr qoldirish</h3>
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Sharhingizni shu yerga yozing..."
          rows={4}
          className="mb-2"
        />
        <Button onClick={handleSubmitComment} disabled={isSubmitting}>
          {isSubmitting ? "Yuborilmoqda..." : "Sharhni yuborish"}
        </Button>
      </div>
    </div>
  )
}


export default function PostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const [post, setPost] = useState<Post | null>(null);
  const [author, setAuthor] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setLoggedInUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (!postId) return;

    async function fetchData() {
      try {
        const postData = await getPostById(postId);
        if (!postData) {
          notFound();
          return;
        }

        const userId = loggedInUser?.id;
        
        if (userId) {
          // Check if this post was viewed by this user before.
          const postRef = doc(db, 'posts', postId);
          const postSnap = await getDoc(postRef);
          if (postSnap.exists()) {
             const postDataFromSnap = postSnap.data();
             if (!postDataFromSnap.viewed_by || !postDataFromSnap.viewed_by.includes(userId)) {
                await incrementPostView(postId, userId);
             }
          }
        }
        
        // We refetch the post to get the updated view count
        const finalPostData = await getPostById(postId);
         if (!finalPostData) {
          notFound();
          return;
        }
        setPost(finalPostData);

        if (finalPostData.author_id) {
          const authorData = await getUserById(finalPostData.author_id);
          setAuthor(authorData);
        }
      } catch (error) {
        console.error("Failed to fetch post:", error);
        toast({ title: "Postni yuklashda xatolik", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [postId, toast, loggedInUser]);
  
  const handleCommentAdded = (newComment: Comment & { author: User | null }) => {
    setPost(prevPost => {
      if (!prevPost) return null;
      const existingComments = prevPost.comments || [];
      return { 
        ...prevPost, 
        comments: [...existingComments, newComment] 
      };
    });
  };

  const handlePostDeleted = () => {
    toast({
        title: "Muvaffaqiyatli!",
        description: "Insho o'chirildi."
    });
    router.push('/');
  }

  if (loading) {
    return <div className="container mx-auto max-w-3xl px-4 py-8 md:py-16 text-center">Yuklanmoqda...</div>;
  }

  if (!post) {
    return notFound();
  }
  
  const isAuthor = loggedInUser?.id === post.author_id;
  const authorInitials = author?.name.split(' ').map(n => n[0]).join('') || 'U';
  const formattedDate = format(new Date(post.created_at), 'dd.MM.yyyy');

  return (
    <article className="container mx-auto max-w-3xl px-4 py-8 md:py-16">
       <div className="mb-4">
        <Button variant="ghost" onClick={() => router.back()} className="pl-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Orqaga
        </Button>
      </div>
      <header className="mb-8 md:mb-12">
         {isAuthor && (
          <TooltipProvider>
            <div className="flex justify-end gap-2 mb-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href={`/posts/${post.id}/edit`}>
                        <Button variant="outline" size="icon">
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Tahrirlash</span>
                        </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Tahrirlash</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DeletePostDialog postId={post.id} onPostDeleted={handlePostDeleted}>
                        <Button variant="destructive" size="icon">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">O'chirish</span>
                        </Button>
                    </DeletePostDialog>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>O'chirish</p>
                  </TooltipContent>
                </Tooltip>
            </div>
          </TooltipProvider>
        )}
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-sm">{tag}</Badge>
          ))}
        </div>
        <h1 className="font-headline text-4xl md:text-5xl font-extrabold leading-tight tracking-tighter mb-4">
          {post.title}
        </h1>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <time dateTime={post.created_at}>{formattedDate}</time>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{post.read_time} daqiqa o'qish</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span>{post.views.toLocaleString()} marta ko'rilgan</span>
          </div>
           <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>{post.comments?.length || 0} sharh</span>
          </div>
        </div>
      </header>
      
      <div className="flex items-center justify-between mb-8 md:mb-12 border-y py-4">
        {author && (
            <Link href={`/profile/${author.id}`} className="flex items-center gap-4 group">
                <Avatar className="h-12 w-12 transition-transform group-hover:scale-105">
                <AvatarImage src={author.avatar_url} alt={author.name} data-ai-hint="avatar" />
                <AvatarFallback>{authorInitials}</AvatarFallback>
                </Avatar>
                <div>
                <p className="font-bold text-lg group-hover:text-primary transition-colors">{author.name}</p>
                <p className="text-sm text-muted-foreground">{author.bio}</p>
                </div>
            </Link>
        )}
        <ShareButton title={post.title} content={post.content} />
      </div>

      <div
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }}
      />

      <CommentSection postId={post.id} initialComments={post.comments || []} onCommentAdded={handleCommentAdded} />
    </article>
  );
}
