
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams, notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { User, Post } from '@/types';
import { getPostById, updatePost } from '@/lib/services/posts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { 
  ssr: false,
  loading: () => (
    <div className="space-y-2">
        <Skeleton className="h-[400px] w-full rounded-md" />
    </div>
  ),
});

export default function EditPostPage() {
  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState(null);
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [isCheckingUser, setIsCheckingUser] = useState(true);
  
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const { toast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setLoggedInUser(JSON.parse(storedUser));
    }
    setIsCheckingUser(false);
  }, []);

  useEffect(() => {
    if (!postId) return;

    async function fetchPost() {
        try {
            const postData = await getPostById(postId);
            if (!postData) {
                notFound();
                return;
            }
            setPost(postData);
            setTitle(postData.title);
            setContent(postData.content);
            setTags(postData.tags.join(', '));
        } catch (error) {
            console.error("Failed to fetch post:", error);
            toast({ title: "Xatolik", description: "Inshoni yuklashda xatolik yuz berdi.", variant: "destructive" });
        }
    }
    fetchPost();
  }, [postId, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggedInUser || !post) {
        toast({ title: "Xatolik", description: "Sizda bu inshoni tahrirlash huquqi yo'q.", variant: "destructive" });
        return;
    }
     if (loggedInUser.id !== post.author_id && loggedInUser.name !== 'Anonim') {
        toast({ title: "Xatolik", description: "Sizda bu inshoni tahrirlash huquqi yo'q.", variant: "destructive" });
        return;
    }
    
    if (!title.trim() || !content) {
        toast({ title: "Xatolik", description: "Sarlavha va kontent bo'sh bo'lishi mumkin emas.", variant: "destructive" });
        return;
    }

    setLoading(true);

    const postData = {
        title,
        content,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
    };

    try {
        await updatePost(post.id, postData);
        toast({ title: "Muvaffaqiyatli!", description: "Insho muvaffaqiyatli yangilandi." });
        router.push(`/explore`);
    } catch (error) {
        console.error("Failed to update post:", error);
        toast({ title: "Xatolik", description: "Inshoni yangilashda xatolik yuz berdi.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  };
  
  if (isCheckingUser || !post || content === null) {
    return <div className="container mx-auto py-12 text-center">Yuklanmoqda...</div>;
  }
  
  if (!loggedInUser || (loggedInUser.id !== post.author_id && loggedInUser.name !== 'Anonim')) {
    return <div className="container mx-auto py-12 text-center text-red-500">Sizda bu sahifani ko'rish huquqi yo'q.</div>;
  }

  return (
    <div className="container mx-auto max-w-4xl py-12">
        <Card>
            <CardHeader>
                <CardTitle className="text-3xl font-headline">Inshoni tahrirlash</CardTitle>
                <CardDescription>O'zgartirishlaringizni kiriting va saqlang.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-lg">Sarlavha</Label>
                        <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Inshongiz sarlavhasi"
                        required
                        className="text-lg py-6"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="content" className="text-lg">Kontent</Label>
                        <RichTextEditor
                           id="content"
                           data={content}
                           onChange={setContent}
                           placeholder="Inshongizni shu yerga yozing..."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tags" className="text-lg">Teglar (vergul bilan ajrating)</Label>
                        <Input
                        id="tags"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="masalan, she'riyat, tarix, falsafa"
                        />
                    </div>
                    <div>
                        <Button type="submit" disabled={loading} size="lg">
                        {loading ? 'Saqlanmoqda...' : 'Saqlash'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    </div>
  );
}
