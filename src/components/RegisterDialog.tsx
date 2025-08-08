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
import { createUser } from '@/lib/services/users';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenuItem } from './ui/dropdown-menu';
import { UserPlus } from 'lucide-react';

interface RegisterDialogProps {
  isDropdownItem?: boolean;
}

export function RegisterDialog({ isDropdownItem = false }: RegisterDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
      // This will reload the page and header will show the user avatar
      window.location.reload(); 
      setOpen(false);
    } catch (e: any) {
        setError(e.message || "Ro'yxatdan o'tishda xatolik yuz berdi.");
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const handleOpenLogin = () => {
    setOpen(false);
    setTimeout(() => {
        const loginTrigger = document.querySelector('[aria-haspopup="dialog"]:not(#register-trigger)');
        if (loginTrigger instanceof HTMLElement) {
            loginTrigger.click();
        }
    }, 150);
  }

  const TriggerComponent = isDropdownItem ? DropdownMenuItem : Button;
  const triggerProps = isDropdownItem 
    ? { id: 'register-trigger' } 
    : { variant: 'outline' as const, id: 'register-trigger' };


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <TriggerComponent {...triggerProps}>
          {isDropdownItem && <UserPlus className="mr-2 h-4 w-4" />}
          Ro'yxatdan o'tish
        </TriggerComponent>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ro'yxatdan o'tish</DialogTitle>
          <DialogDescription>Hisob qaydnomasi yarating va o'z insholaringizni yozishni boshlang.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Ism
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reg-password" name="password" className="text-right">
              Parol
            </Label>
            <Input
              id="reg-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm col-span-4 text-center">{error}</p>}
        </div>
        <DialogFooter className="flex-col !space-y-2 sm:flex-col sm:!space-y-2 sm:!justify-end">
            <Button onClick={handleRegister} disabled={loading} className="w-full">
                {loading ? "Ro'yxatdan o'tilmoqda..." : "Ro'yxatdan o'tish"}
            </Button>
             <p className="text-sm text-center text-muted-foreground">
                Hisobingiz bormi?{' '}
                <Button variant="link" size="sm" onClick={handleOpenLogin} className="p-0 h-auto">
                    Kirish
                </Button>
            </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
