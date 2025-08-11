
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

const getWordCount = (content: any): number => {
    if (!content || !content.blocks) return 0;
    const text = content.blocks
        .filter((block: any) => block.type === 'paragraph' || block.type === 'header')
        .map((block: any) => block.data.text.replace(/<[^>]*>?/gm, ''))
        .join(' ');
    return text.trim().split(/\s+/).filter(Boolean).length;
};


export default function EditPostPage() {
  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<any>(null);
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(''); // 'publish', 'draft', or ''
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

  const handleSubmit = async (status: 'published' | 'draft') => {
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
    
    if (getWordCount(content) < 70) {
        toast({ title: "Xatolik", description: "Insho kamida 70 ta so'zdan iborat bo'lishi kerak.", variant: "destructive" });
        return;
    }

    setLoading(status);

    const postData = {
        title,
        content,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        status,
    };

    try {
        await updatePost(post.id, postData);
        toast({ title: "Muvaffaqiyatli!", description: `Insho muvaffaqiyatli ${status === 'published' ? 'nashr etildi' : 'qoralama sifatida saqlandi'}.` });
        router.push(`/explore`);
    } catch (error) {
        console.error("Failed to update post:", error);
        toast({ title: "Xatolik", description: "Inshoni yangilashda xatolik yuz berdi.", variant: "destructive" });
    } finally {
        setLoading('');
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
                <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
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
                    <div className="flex flex-wrap gap-4">
                        <Button onClick={() => handleSubmit('published')} disabled={!!loading} size="lg">
                            {loading === 'publish' ? 'Nashr etilmoqda...' : 'Nashr etish'}
                        </Button>
                         <Button onClick={() => handleSubmit('draft')} disabled={!!loading} size="lg" variant="outline">
                            {loading === 'draft' ? 'Saqlanmoqda...' : post?.status === 'draft' ? 'Qoralamani saqlash' : 'Qoralama sifatida saqlash' }
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    </div>
  );
}
