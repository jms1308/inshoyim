import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { mockPosts, mockUsers } from '@/lib/mock-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Eye } from 'lucide-react';
import { ShareButton } from '@/components/ShareButton';

export default function PostPage({ params }: { params: { id: string } }) {
  const post = mockPosts.find((p) => p.id === params.id);
  
  if (!post) {
    notFound();
  }

  const author = mockUsers.find((u) => u.id === post.author_id);
  const authorInitials = author?.name.split(' ').map(n => n[0]).join('') || 'U';

  const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="container mx-auto max-w-3xl px-4 py-8 md:py-16">
      <header className="mb-8 md:mb-12">
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-sm">{tag}</Badge>
          ))}
        </div>
        <h1 className="font-headline text-4xl md:text-5xl font-extrabold leading-tight tracking-tighter mb-4">
          {post.title}
        </h1>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <time dateTime={post.created_at}>{formattedDate}</time>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{post.read_time} min read</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span>{post.views.toLocaleString()} views</span>
          </div>
        </div>
      </header>
      
      <div className="flex items-center justify-between mb-8 md:mb-12 border-y py-4">
        {author && (
            <Link href={`/profile/${author.id}`} className="flex items-center gap-4 group">
                <Avatar className="h-12 w-12 transition-transform group-hover:scale-105">
                <AvatarImage src={author.avatar_url} alt={author.name} data-ai-hint="avatar" />
                <AvatarFallback>{authorInitials}</AvatarFallback>
                </Avatar>
                <div>
                <p className="font-bold text-lg group-hover:text-primary transition-colors">{author.name}</p>
                <p className="text-sm text-muted-foreground">{author.bio}</p>
                </div>
            </Link>
        )}
        <ShareButton title={post.title} />
      </div>

      <div
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }}
      />
    </article>
  );
}
