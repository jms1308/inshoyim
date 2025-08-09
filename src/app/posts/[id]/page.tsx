
'use client';

import { useParams, notFound, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPostById, incrementPostView, addCommentToPost, deleteCommentFromPost } from '@/lib/services/posts';
import { getUserById } from '@/lib/services/users';
import type { Post, User, Comment } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Eye, MessageSquare, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { ShareButton } from '@/components/ShareButton';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { DeletePostDialog } from '@/components/DeletePostDialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PostSettings, type FontSettings } from '@/components/PostSettings';

function CommentSection({ postId, initialComments, onCommentAdded, onCommentDeleted, loggedInUser }: { postId: string, initialComments: Comment[], onCommentAdded: (comment: (Comment & { author: User | null })) => void, onCommentDeleted: (commentId: string) => void, loggedInUser: User | null }) {
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
      setCommentsWithAuthors(commentsData.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    }
    if (initialComments) {
      fetchAuthors();
    }
  }, [initialComments]);

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteCommentFromPost(postId, commentId);
      onCommentDeleted(commentId);
      setCommentsWithAuthors(prev => prev.filter(c => c.id !== commentId));
      toast({
        title: "Muvaffaqiyatli!",
        description: "Sharh o'chirildi."
      });
    } catch (error) {
       console.error("Failed to delete comment:", error);
       toast({
        title: "Xatolik!",
        description: "Sharhni o'chirishda xatolik yuz berdi.",
        variant: "destructive"
      });
    }
  };

  const handleSubmitComment = async () => {
    if (!loggedInUser) {
        toast({ title: "Xatolik", description: "Izoh qoldirish uchun tizimga kiring.", variant: "destructive"});
        return;
    }
    const userId = loggedInUser.id;

    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const addedComment = await addCommentToPost(postId, userId, newComment);
      const author = await getUserById(userId);
      const newCommentWithAuthor = { ...addedComment, author };

      onCommentAdded(newCommentWithAuthor); // Update parent state
      setCommentsWithAuthors(prev => [newCommentWithAuthor, ...prev]); // Update local state
      
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
          <div key={`${comment.id}-${index}`} className="flex gap-4 group">
             <Avatar>
                <AvatarImage src={comment.author?.avatar_url} alt={comment.author?.name} data-ai-hint="avatar" />
                <AvatarFallback>{comment.author?.name.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-grow">
              <div className="flex items-center justify-between">
                <div>
                   <p className="font-bold">{comment.author?.name}</p>
                   <p className="text-sm text-muted-foreground mb-1">
                      {format(new Date(comment.created_at), 'dd.MM.yyyy')}
                   </p>
                </div>
                {loggedInUser?.id === comment.user_id && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Sharhni o'chirishga ishonchingiz komilmi?</AlertDialogTitle>
                        <AlertDialogDescription>
                           Bu amalni qaytarib bo'lmaydi. Bu sizning sharhingizni butunlay o'chirib tashlaydi.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteComment(comment.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Ha, o'chirish
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
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
  const [fontSettings, setFontSettings] = useState<FontSettings>({
    size: 16,
    family: 'font-body'
  });

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
        let postData = await getPostById(postId);
        if (!postData) {
          notFound();
          return;
        }

        // --- View Count Logic ---
        const viewedPostsKey = 'viewed_posts';
        const viewedPosts = JSON.parse(localStorage.getItem(viewedPostsKey) || '[]');

        if (!viewedPosts.includes(postId)) {
            await incrementPostView(postId);
            viewedPosts.push(postId);
            localStorage.setItem(viewedPostsKey, JSON.stringify(viewedPosts));
            // Refetch post data to get updated view count
            postData = await getPostById(postId);
            if (!postData) {
              notFound();
              return;
            }
        }
        // --- End View Count Logic ---

        setPost(postData);

        if (postData.author_id) {
          const authorData = await getUserById(postData.author_id);
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
  }, [postId, toast]);
  
  const handleCommentAdded = (newComment: Comment & { author: User | null }) => {
    setPost(prevPost => {
      if (!prevPost) return null;
      const existingComments = prevPost.comments || [];
      return { 
        ...prevPost, 
        comments: [newComment, ...existingComments]
      };
    });
  };

  const handleCommentDeleted = (commentId: string) => {
     setPost(prevPost => {
      if (!prevPost) return null;
      const updatedComments = (prevPost.comments || []).filter(c => c.id !== commentId);
      return { 
        ...prevPost, 
        comments: updatedComments
      };
    });
  }

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
        <div className="flex items-center gap-2">
            <PostSettings settings={fontSettings} onSettingsChange={setFontSettings} />
            <ShareButton title={post.title} content={post.content} />
        </div>
      </div>

      <div
        className={`prose dark:prose-invert max-w-none ${fontSettings.family}`}
        style={{ fontSize: `${fontSettings.size}px` }}
        dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }}
      />

      <CommentSection 
        postId={post.id} 
        initialComments={post.comments || []} 
        onCommentAdded={handleCommentAdded}
        onCommentDeleted={handleCommentDeleted}
        loggedInUser={loggedInUser}
      />
    </article>
  );
}
