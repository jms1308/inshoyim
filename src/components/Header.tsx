
'use client';

import Link from 'next/link';
import {
  Feather,
  LogOut,
  User as UserIcon,
  Menu,
  Home,
  Compass,
  Edit,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { LoginDialog } from '@/components/LoginDialog';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
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
import { useAuthDialog } from '@/context/AuthDialogContext';
import { Progress } from './ui/progress';
import { useAchievement } from '@/context/AchievementContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

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
                <Feather className="h-6 w-6 text-primary" />
                <span className="font-headline text-xl font-bold">Inshoyim</span>
            </Link>
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col space-y-4 py-8">
            <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-3 rounded-md p-2 text-lg font-medium hover:bg-muted font-headline">
                <Home className='h-5 w-5' />
                Asosiy
            </Link>
             <Link href="/explore" onClick={() => setIsOpen(false)} className="flex items-center gap-3 rounded-md p-2 text-lg font-medium hover:bg-muted font-headline">
                <Compass className='h-5 w-5' />
                Insholar
            </Link>
            <Link href="/yozish" onClick={() => setIsOpen(false)} className="flex items-center gap-3 rounded-md p-2 text-lg font-medium hover:bg-muted font-headline">
                <Edit className='h-5 w-5' />
                Yozish
            </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function AuthButtons({ isDropdown = false }: { isDropdown?: boolean }) {
  const { setLoginOpen, setRegisterOpen } = useAuthDialog();

  if (isDropdown) {
    return (
      <>
        <DropdownMenuItem onSelect={() => setLoginOpen(true)}>
          <UserIcon className="mr-2 h-4 w-4" />
          <span>Kirish</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setRegisterOpen(true)}>
          <Feather className="mr-2 h-4 w-4" />
          <span>Ro'yxatdan o'tish</span>
        </DropdownMenuItem>
      </>
    );
  }

  return (
    <>
      <Button variant="outline" onClick={() => setLoginOpen(true)}>
        Kirish
      </Button>
      <Button onClick={() => setRegisterOpen(true)}>
        Ro'yxatdan o'tish
      </Button>
    </>
  );
}

function UserMenuLabel({ user }: { user: User }) {
    const { achievements } = useAchievement(user.id);

    return (
        <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-medium leading-none">
                        {user.name}
                    </p>
                    {achievements.length > 0 && (
                        <TooltipProvider>
                            <div className="flex items-center gap-1.5">
                                {achievements.map(ach => (
                                    <Tooltip key={ach.type}>
                                        <TooltipTrigger className="h-4 w-4 text-amber-500">
                                            {ach.icon}
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="font-bold">{ach.title}</p>
                                            <p>{ach.description}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                            </div>
                        </TooltipProvider>
                    )}
                </div>
                <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                </p>
            </div>
        </DropdownMenuLabel>
    );
}

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const pathname = usePathname();

  const isPostPage = pathname.startsWith('/posts/');

  useEffect(() => {
    // Check if user data exists in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const handleStorageChange = () => {
       const storedUser = localStorage.getItem('user');
       if (storedUser) {
         setUser(JSON.parse(storedUser));
       } else {
         setUser(null);
       }
    };
    window.addEventListener('storage', handleStorageChange);

    const handleScroll = () => {
        const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = window.scrollY;
        const progress = (scrolled / totalHeight) * 100;
        setScrollProgress(progress);
    };

    if (isPostPage) {
        window.addEventListener('scroll', handleScroll);
    }
    
    return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('scroll', handleScroll);
    };
  }, [isPostPage]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    window.dispatchEvent(new Event('storage'));
    window.location.href = '/';
  };
  
  const authorInitials = user?.name
    .split(' ')
    .map((n) => n[0])
    .join('') || 'U';

  return (
    <>
      <LoginDialog />
      <RegisterDialog />
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
              <div className='md:hidden'>
                  <MobileNav user={user} />
              </div>
              <Link href="/" className="hidden md:flex items-center gap-2">
              <Feather className="h-6 w-6 text-primary" />
              <span className="font-headline text-xl font-bold">Inshoyim</span>
              </Link>
          </div>

          <Link href="/" className="flex md:hidden items-center gap-2">
            <Feather className="h-6 w-6 text-primary" />
            <span className="font-headline text-xl font-bold">Inshoyim</span>
          </Link>
          
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link
              href="/"
              className="transition-colors hover:text-foreground/80 text-foreground/60 font-headline"
            >
              Asosiy
            </Link>
            <Link
              href="/explore"
              className="transition-colors hover:text-foreground/80 text-foreground/60 font-headline"
            >
              Insholar
            </Link>
            <Link
              href="/yozish"
              className="transition-colors hover:text-foreground/80 text-foreground/60 font-headline"
            >
              Yozish
            </Link>
          </nav>
          <div className="flex items-center gap-2 md:gap-4">
            <ThemeToggle />
            {user ? (
             <>
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
                        />
                        <AvatarFallback>{authorInitials}</AvatarFallback>
                        </Avatar>
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                    <UserMenuLabel user={user} />
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
             </>
            ) : (
              <>
                <div className="hidden md:flex items-center gap-2">
                   <AuthButtons />
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
                    <DropdownMenuContent className="w-48" align="end" forceMount>
                       <AuthButtons isDropdown={true} />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            )}
          </div>
        </div>
         {isPostPage && (
            <Progress value={scrollProgress} className="absolute bottom-0 left-0 w-full h-[3px] rounded-none bg-transparent" />
        )}
      </header>
    </>
  );
}
