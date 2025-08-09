
'use client';

import { cn } from '@/lib/utils';

interface SplineSceneProps {
    url: string;
    className?: string;
}

export function SplineScene({ url, className }: SplineSceneProps) {
    return (
        <iframe
            src={url}
            frameBorder="0"
            width="100%"
            height="100%"
            className={cn('rounded-xl', className)}
        ></iframe>
    );
}
