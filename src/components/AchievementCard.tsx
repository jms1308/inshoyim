
'use client';

import Link from 'next/link';
import type { Achievement } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from './ui/skeleton';

interface AchievementCardProps {
  achievement: Achievement;
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  const holderInitials = achievement.holderName?.split(' ').map(n => n[0]).join('') || '?';

  return (
    <Card className="flex flex-col h-full text-center">
      <CardHeader>
        <div className="mx-auto bg-amber-100 dark:bg-amber-900/50 text-amber-500 p-4 rounded-full w-max">
            {achievement.icon}
        </div>
        <CardTitle className="font-headline text-2xl pt-2">{achievement.title}</CardTitle>
        <CardDescription>{achievement.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col items-center justify-center gap-2">
         {achievement.holderId ? (
          <Link href={`/profile/${achievement.holderId}`} className="group">
            <div className="flex flex-col items-center gap-2">
                <Avatar className="h-16 w-16 border-2 border-amber-400">
                    <AvatarImage src={achievement.holderAvatarUrl ?? undefined} alt={achievement.holderName ?? "G'olib"} />
                    <AvatarFallback>{holderInitials}</AvatarFallback>
                </Avatar>
                <p className="font-bold group-hover:text-primary transition-colors">{achievement.holderName}</p>
                <p className="text-sm text-muted-foreground font-mono bg-muted px-2 py-1 rounded-md">{achievement.value}</p>
            </div>
           </Link>
         ) : (
            <div className="text-muted-foreground">Hozircha g'olib yo'q</div>
         )}
      </CardContent>
    </Card>
  );
}

export function AchievementCardSkeleton() {
    return (
        <Card className="flex flex-col h-full text-center">
            <CardHeader>
                <Skeleton className="h-20 w-20 rounded-full mx-auto" />
                <Skeleton className="h-7 w-48 mx-auto mt-4" />
                <Skeleton className="h-4 w-64 mx-auto mt-2" />
                 <Skeleton className="h-4 w-56 mx-auto mt-1" />
            </CardHeader>
            <CardContent className="flex-grow flex flex-col items-center justify-center gap-2">
                <Skeleton className="h-16 w-16 rounded-full" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-6 w-20" />
            </CardContent>
        </Card>
    )
}
