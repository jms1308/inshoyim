'use client';

import Link from 'next/link';
import {
  BookOpenText,
  LogOut,
  User as UserIcon,
  PlusCircle,
  Menu,
  Home,
  Compass,
  Edit,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { LoginDialog } from '@/components/LoginDialog';
import { useEffect, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import type { User } from '@/types';
import { RegisterDialog } from './RegisterDialog';

function MobileNav({ user }: { user: User | null }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Menyuni ochish</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle asChild>
             <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                <BookOpenText className="h-6 w-6 text-primary" />
                <span className="font-headline text-xl font-bold">Notiq Insholar</span>
            </Link>
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col space-y-4 py-8">
            <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-3 rounded-md p-2 text-lg font-medium hover:bg-muted">
                <Home className='h-5 w-5' />
                Bosh Sahifa
            </Link>
             <Link href="/explore" onClick={() => setIsOpen(false)} className="flex items-center gap-3 rounded-md p-2 text-lg font-medium hover:bg-muted">
                <Compass className='h-5 w-5' />
                O'rganish
            </Link>
            <Link href="/yozish" onClick={() => setIsOpen(false)} className="flex items-center gap-3 rounded-md p-2 text-lg font-medium hover:bg-muted">
                <Edit className='h-5 w-5' />
                Yozish
            </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function Header() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user data exists in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    // Optionally redirect to home page
    window.location.href = '/';
  };

  const authorInitials = user?.name
    .split(' ')
    .map((n) => n[0])
    .join('') || 'U';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
            <div className='md:hidden'>
                <MobileNav user={user} />
            </div>
            <Link href="/" className="hidden md:flex items-center gap-2">
            <BookOpenText className="h-6 w-6 text-primary" />
            <span className="font-headline text-xl font-bold">Notiq Insholar</span>
            </Link>
        </div>

        <Link href="/" className="flex md:hidden items-center gap-2">
          <BookOpenText className="h-6 w-6 text-primary" />
          <span className="font-headline text-xl font-bold">Notiq</span>
        </Link>
        
        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link
            href="/"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Bosh Sahifa
          </Link>
          <Link
            href="/explore"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            O'rganish
          </Link>
           <Link
            href="/yozish"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Yozish
          </Link>
        </nav>
        <div className="flex items-center gap-2 md:gap-4">
          <ThemeToggle />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={user.avatar_url}
                      alt={user.name}
                      data-ai-hint="avatar"
                    />
                    <AvatarFallback>{authorInitials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/profile/${user.id}`}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Chiqish</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <div className="hidden md:flex items-center gap-2">
                <LoginDialog />
                <RegisterDialog />
              </div>
              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Button
                        variant="ghost"
                        className="relative h-8 w-8 rounded-full"
                    >
                        <Avatar className="h-9 w-9">
                            <AvatarFallback>
                                <UserIcon />
                            </AvatarFallback>
                        </Avatar>
                     </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-40" align="end" forceMount>
                    <LoginDialog isDropdownItem={true} />
                    <RegisterDialog isDropdownItem={true} />
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
