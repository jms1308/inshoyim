
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Post, User } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Eye, Clock, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EssayCardProps {
  post: Post;
  index?: number;
}

const getExcerptFromContent = (content: any): string => {
    if (typeof content === 'string') {
        return content.split(' ').slice(0, 25).join(' ') + '...';
    }
    if (!content || !content.blocks || content.blocks.length === 0) {
        return '';
    }
    const firstParagraph = content.blocks.find((block: any) => block.type === 'paragraph');
    if (firstParagraph && firstParagraph.data && firstParagraph.data.text) {
        const cleanText = firstParagraph.data.text.replace(/<[^>]*>?/gm, '');
        return cleanText.split(' ').slice(0, 25).join(' ') + '...';
    }
    return '';
};


export function EssayCard({ post, index = 0 }: EssayCardProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 100); // Staggered delay
    return () => clearTimeout(timer);
  }, [index]);

  const excerpt = getExcerptFromContent(post.content);
  const author = post.author;
  const authorInitials = author?.name.split(' ').map(n => n[0]).join('') || 'U';

  return (
    <Link href={`/posts/${post.id}`} className="group block">
      <Card className={cn(
        "flex flex-col h-full overflow-hidden transition-all duration-700 ease-out transform",
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5',
        "group-hover:shadow-xl group-hover:-translate-y-2" // Combined hover effects
      )}>
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
          <div className="w-full flex items-center justify-between gap-x-2 text-sm text-muted-foreground">
             <div className="flex items-center gap-2 shrink-0">
              <Avatar className="h-8 w-8">
                <AvatarImage src={author?.avatar_url} alt={author?.name} />
                <AvatarFallback>{authorInitials}</AvatarFallback>
              </Avatar>
              {author ? (
                <span className="font-medium whitespace-nowrap text-xs sm:text-sm truncate">{author.name}</span>
              ) : (
                <span className="font-medium whitespace-nowrap text-xs sm:text-sm">Noma'lum</span>
              )}
            </div>
            <div className="flex items-center gap-x-2 sm:gap-x-3">
               <div className="flex items-center gap-1" title="Ko'rishlar">
                 <Eye className="h-4 w-4" />
                 <span className="text-xs sm:text-sm">{post.views}</span>
               </div>
               <div className="hidden sm:flex items-center gap-1" title="O'qish vaqti">
                 <Clock className="h-4 w-4" />
                 <span className="text-xs sm:text-sm">{post.read_time} daq</span>
               </div>
               <div className="flex items-center gap-1" title="Sharhlar">
                 <MessageSquare className="h-4 w-4" />
                 <span className="text-xs sm:text-sm">{post.comments?.length || 0}</span>
                </div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
