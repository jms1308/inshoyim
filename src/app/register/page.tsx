'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createUser } from '@/lib/services/users';
import { useToast } from '@/hooks/use-toast';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleRegister = async () => {
    if (password.length < 6) {
        setError("Parol kamida 6 belgidan iborat bo'lishi kerak.");
        return;
    }
    setLoading(true);
    setError('');
    try {
      await createUser(name, email, password);
       toast({
        title: 'Muvaffaqiyatli!',
        description: "Siz ro'yxatdan o'tdingiz. Endi tizimga kirishingiz mumkin.",
      });
      router.push('/'); // Redirect to login page after successful registration
    } catch (e: any) {
        setError(e.message || "Ro'yxatdan o'tishda xatolik yuz berdi.");
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-12rem)] py-12">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Ro'yxatdan o'tish</CardTitle>
          <CardDescription>Hisob qaydnomasi yarating va o'z insholaringizni yozishni boshlang.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Ism</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Parol</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button onClick={handleRegister} disabled={loading} className="w-full">
            {loading ? "Ro'yxatdan o'tilmoqda..." : "Ro'yxatdan o'tish"}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Hisobingiz bormi?{' '}
            <Link href="/" className="underline hover:text-primary">
              Kirish
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
