
'use client';

import Link from 'next/link';
import type { User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BookUser } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthorCardProps {
  author: User & { postCount: number };
}

export function AuthorCard({ author }: AuthorCardProps) {
  const authorInitials = author.name.split(' ').map(n => n[0]).join('') || 'U';

  return (
    <Link href={`/profile/${author.id}`} className="group block h-full">
      <Card className={cn(
        "flex flex-col h-full overflow-hidden transition-all duration-300 ease-in-out",
        "group-hover:shadow-xl group-hover:-translate-y-1"
      )}>
        <CardContent className="p-4 flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={author.avatar_url} alt={author.name} />
            <AvatarFallback>{authorInitials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-bold truncate group-hover:text-primary transition-colors">{author.name}</p>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                <BookUser className="h-4 w-4" />
                <span>{author.postCount} insho</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
