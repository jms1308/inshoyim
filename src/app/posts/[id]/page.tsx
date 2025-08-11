
import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { getPostById } from '@/lib/services/posts';
import { getUserById } from '@/lib/services/users';
import PostClientPage from './PostClientPage';

// Function to extract text from Editor.js content for SEO
const getTextFromContent = (content: any): string => {
  if (typeof content === 'string') return content;
  if (!content || !content.blocks) return '';
  return content.blocks
    .filter((block: any) => block.type === 'paragraph' || block.type === 'header')
    .map((block: any) => block.data.text)
    .join(' ')
    .replace(/<[^>]*>?/gm, ''); // Strip any remaining HTML
};

const getFirstImageUrl = (content: any): string | null => {
  if (!content || !content.blocks) return null;
  const imageBlock = content.blocks.find((block: any) => block.type === 'image' && block.data?.file?.url);
  return imageBlock ? imageBlock.data.file.url : null;
};


type Props = {
  params: { id: string }
}
 
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = params.id
 
  const post = await getPostById(id);
 
  if (!post) {
    return {
      title: 'Insho topilmadi',
      description: "Siz qidirayotgan insho mavjud emas.",
    }
  }

  const postText = getTextFromContent(post.content);
  const description = postText.substring(0, 160).trim() + (postText.length > 160 ? '...' : '');
  const author = await getUserById(post.author_id);
  const imageUrl = getFirstImageUrl(post.content) || '/og-image.png'; // Fallback to default OG image
 
  return {
    title: post.title,
    description: description,
    keywords: post.tags,
    authors: author ? [{ name: author.name }] : [],
    openGraph: {
      title: post.title,
      description: description,
      url: `/posts/${id}`,
      type: 'article',
      publishedTime: post.created_at,
      authors: author ? [author.name] : [],
      images: [
        {
          url: imageUrl,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: description,
      images: [imageUrl],
    },
  }
}


export default async function PostPage({ params }: Props) {
  const post = await getPostById(params.id);

  if (!post) {
    notFound();
  }

  const author = post.author_id ? await getUserById(post.author_id) : null;

  return <PostClientPage initialPost={post} initialAuthor={author} />;
}
