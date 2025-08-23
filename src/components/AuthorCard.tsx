
'use client';

import Link from 'next/link';
import type { User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BookUser, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAchievement } from '@/context/AchievementContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Button } from './ui/button';

interface AuthorCardProps {
  author: User & { postCount: number };
}

export function AuthorCard({ author }: AuthorCardProps) {
  const authorInitials = author.name.split(' ').map(n => n[0]).join('') || 'U';
  const { achievements } = useAchievement(author.id);

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
            <div className="flex items-center gap-2">
                <p className="font-bold truncate group-hover:text-primary transition-colors">{author.name}</p>
                {achievements.length > 0 && (
                    <TooltipProvider>
                        {achievements.map(ach => (
                            <Tooltip key={ach.type}>
                                <TooltipTrigger asChild>
                                     <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-amber-500 hover:text-amber-400"
                                      onClick={(e) => {
                                          e.preventDefault(); // Prevents link navigation on tap
                                      }}
                                    >
                                        <Trophy className="h-5 w-5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="font-bold">{ach.title}</p>
                                    <p>{ach.description}</p>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </TooltipProvider>
                )}
            </div>
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
