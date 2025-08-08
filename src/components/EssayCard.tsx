'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Post, User } from '@/types';
import { getUserById } from '@/lib/services/users';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Eye, Clock, MessageSquare } from 'lucide-react';

interface EssayCardProps {
  post: Post;
}

export function EssayCard({ post }: EssayCardProps) {
  const [author, setAuthor] = useState<User | null>(null);

  useEffect(() => {
    async function fetchAuthor() {
      if (post.author_id) {
        const authorData = await getUserById(post.author_id);
        setAuthor(authorData);
      }
    }
    fetchAuthor();
  }, [post.author_id]);

  const excerpt = post.content.split(' ').slice(0, 25).join(' ') + '...';
  const authorInitials = author?.name.split(' ').map(n => n[0]).join('') || 'U';

  return (
    <Link href={`/posts/${post.id}`} className="group block">
      <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
        <CardHeader>
          <CardTitle className="font-headline text-2xl leading-tight group-hover:text-primary transition-colors">
            {post.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-muted-foreground line-clamp-3">{excerpt}</p>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-4">
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
          <div className="w-full flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={author?.avatar_url} alt={author?.name} data-ai-hint="avatar" />
                <AvatarFallback>{authorInitials}</AvatarFallback>
              </Avatar>
              {author ? (
                <span className="font-medium">{author.name}</span>
              ) : (
                <span className="font-medium">Noma'lum</span>
              )}
            </div>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-1.5" title="Ko'rishlar">
                 <Eye className="h-4 w-4" />
                 <span>{post.views}</span>
               </div>
               <div className="flex items-center gap-1.5" title="O'qish vaqti">
                 <Clock className="h-4 w-4" />
                 <span>{post.read_time} daq</span>
               </div>
               <div className="flex items-center gap-1.5" title="Sharhlar">
                 <MessageSquare className="h-4 w-4" />
                 <span>{post.comments?.length || 0}</span>
                </div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
