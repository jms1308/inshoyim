'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getUserByEmailOrName } from '@/lib/services/users';
import { useToast } from '@/hooks/use-toast';
import { RegisterDialog } from './RegisterDialog';

export function LoginDialog() {
  const [open, setOpen] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const user = await getUserByEmailOrName(identifier);
      if (user && user.password === password) {
        toast({
          title: 'Muvaffaqiyatli!',
          description: "Siz tizimga kirdingiz.",
        });
        localStorage.setItem('user', JSON.stringify(user));
        // This will reload the page and header will show the user avatar
        window.location.reload(); 
        setOpen(false);
      } else {
        setError("Ism yoki parol noto'g'ri.");
      }
    } catch (e) {
      setError("Tizimga kirishda xatolik yuz berdi.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenRegister = () => {
    setOpen(false);
    // We need a slight delay to ensure the register dialog can open
    setTimeout(() => {
      document.getElementById('register-trigger')?.click();
    }, 100);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">Kirish</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Kirish</DialogTitle>
          <DialogDescription>
            Davom etish uchun profilingizga kiring.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="identifier" className="text-right">
              Ism / Email
            </Label>
            <Input
              id="identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" name="password" className="text-right">
              Parol
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="col-span-3"
            />
          </div>
          {error && <p className="text-red-500 text-sm col-span-4 text-center">{error}</p>}
        </div>
        <DialogFooter className="flex-col !space-y-2 sm:flex-col sm:!space-y-2 sm:!justify-end">
            <Button onClick={handleLogin} disabled={loading} className="w-full">
                {loading ? 'Kirilmoqda...' : 'Kirish'}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
                Hisobingiz yo'qmi?{' '}
                <Button variant="link" size="sm" onClick={handleOpenRegister} className="p-0 h-auto">
                    Roʻyxatdan oʻtish
                </Button>
            </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
