import Link from 'next/link';
import { BookOpenText } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <BookOpenText className="h-6 w-6 text-primary" />
          <span className="font-headline text-xl font-bold">Eloquent Essays</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link href="/" className="transition-colors hover:text-foreground/80 text-foreground/60">
            Home
          </Link>
          <Link href="/explore" className="transition-colors hover:text-foreground/80 text-foreground/60">
            Explore
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" className="hidden md:inline-flex">Login</Button>
          <Button>Write</Button>
        </div>
      </div>
    </header>
  );
}
