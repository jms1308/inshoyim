'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/types';
import { createPost } from '@/lib/services/posts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthDialog } from '@/context/AuthDialogContext';
import { Skeleton } from '@/components/ui/skeleton';

function AuthPrompt() {
  const { setLoginOpen, setRegisterOpen } = useAuthDialog();

  return (
    <div className="container mx-auto max-w-xl py-12 text-center">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Yozishni boshlang</CardTitle>
          <CardDescription>Insho yozish yoki tahrirlash uchun tizimga kiring yoki roʻyxatdan oʻting.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button onClick={() => setLoginOpen(true)}>Kirish</Button>
          <Button variant="outline" onClick={() => setRegisterOpen(true)}>Roʻyxatdan oʻtish</Button>
        </CardContent>
      </Card>
    </div>
  );
}


export default function WritePage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState(null);
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isCheckingUser, setIsCheckingUser] = useState(true);
  
  const router = useRouter();
  const { toast } = useToast();

  const RichTextEditor = useMemo(() => 
    dynamic(() => import('@/components/RichTextEditor'), { 
      ssr: false,
      loading: () => (
        <div className="space-y-2">
            <Skeleton className="h-[400px] w-full rounded-md" />
        </div>
      ),
    }), 
  []);

  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
      setIsCheckingUser(false);
    }
    
    checkUser();
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        toast({ title: "Xatolik", description: "Insho yaratish uchun tizimga kirishingiz kerak.", variant: "destructive" });
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
        author_id: user.id
    };

    try {
        const newPost = await createPost(postData);
        toast({ title: "Muvaffaqiyatli!", description: "Insho muvaffaqiyatli yaratildi." });
        router.push(`/posts/${newPost.id}`);
    } catch (error) {
        console.error("Failed to create post:", error);
        toast({ title: "Xatolik", description: "Insho yaratishda xatolik yuz berdi.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  };
  
  if (isCheckingUser) {
    return <div className="container mx-auto py-12 text-center">Yuklanmoqda...</div>;
  }
  
  if (!user) {
    return <AuthPrompt />;
  }

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 md:px-6">
        <Card>
            <CardHeader>
                <CardTitle className="text-3xl font-headline">Yangi insho yaratish</CardTitle>
                <CardDescription>Fikrlaringizni dunyo bilan baham ko'ring.</CardDescription>
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
                        {loading ? 'Nashr etilmoqda...' : 'Nashr etish'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    </div>
  );
}
