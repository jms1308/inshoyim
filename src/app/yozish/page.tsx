
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { User, Post } from '@/types';
import { createPost } from '@/lib/services/posts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthDialog } from '@/context/AuthDialogContext';
import { Skeleton } from '@/components/ui/skeleton';

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { 
  ssr: false,
  loading: () => (
    <div className="space-y-2">
        <Skeleton className="h-[400px] w-full rounded-md" />
    </div>
  ),
});

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

const getWordCount = (content: any): number => {
    if (!content || !content.blocks) return 0;
    const text = content.blocks
        .filter((block: any) => block.type === 'paragraph' || block.type === 'header')
        .map((block: any) => block.data.text.replace(/<[^>]*>?/gm, ''))
        .join(' ');
    return text.trim().split(/\s+/).filter(Boolean).length;
};


export default function WritePage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<any>(null);
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(''); // 'publish', 'draft', or ''
  const [user, setUser] = useState<User | null>(null);
  const [isCheckingUser, setIsCheckingUser] = useState(true);
  
  const router = useRouter();
  const { toast } = useToast();

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

  const handleSubmit = async (status: 'published' | 'draft') => {
    if (!user) {
        toast({ title: "Xatolik", description: "Insho yaratish uchun tizimga kirishingiz kerak.", variant: "destructive" });
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
        author_id: user.id,
        status,
    };

    try {
        await createPost(postData);
        toast({ title: "Muvaffaqiyatli!", description: `Insho muvaffaqiyatli ${status === 'published' ? 'nashr etildi' : 'qoralama sifatida saqlandi'}.` });
        router.push(`/explore`);
    } catch (error) {
        console.error("Failed to create post:", error);
        toast({ title: "Xatolik", description: "Insho yaratishda xatolik yuz berdi.", variant: "destructive" });
    } finally {
        setLoading('');
    }
  };
  
  if (isCheckingUser) {
    return <div className="container mx-auto py-12 text-center">Yuklanmoqda...</div>;
  }
  
  if (!user) {
    return <AuthPrompt />;
  }

  return (
    <div className="container mx-auto max-w-4xl py-12 px-2 md:px-6">
        <Card>
            <CardHeader>
                <CardTitle className="text-3xl font-headline">Yangi insho yaratish</CardTitle>
                <CardDescription>Fikrlaringizni dunyo bilan baham ko'ring.</CardDescription>
            </CardHeader>
            <CardContent className="p-2 sm:p-6">
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
                            {loading === 'draft' ? 'Saqlanmoqda...' : 'Qoralama sifatida saqlash'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    </div>
  );
}
