
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { EssayCard } from '@/components/EssayCard';
import { getPublishedPosts } from '@/lib/services/posts';
import type { Post } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowRight, Edit, BookOpen, Globe } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const FeatureCard = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <Card className="text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <CardHeader className="items-center">
            <div className="p-3 bg-primary/10 rounded-full mb-2">
                {icon}
            </div>
            <CardTitle className="font-headline">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="font-body">{children}</p>
        </CardContent>
    </Card>
);


export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  const phrases = ['Inshoyim 1.0', 'O‘qing. Yozing. Ulashing.'];
  const [dynamicText, setDynamicText] = useState(phrases[0]);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(phrases[0].length);
  const [isDeleting, setIsDeleting] = useState(true);
  const [isInitialDelay, setIsInitialDelay] = useState(true);

  const typingSpeed = 150;
  const deletingSpeed = 100;
  const delayBetweenPhrases = 2000;
  const initialDelay = 1000; // 1 second

  useEffect(() => {
    if(isInitialDelay) {
      setTimeout(() => setIsInitialDelay(false), initialDelay);
      return;
    }

    const handleTyping = () => {
      const currentPhrase = phrases[phraseIndex];
      if (isDeleting) {
        if (charIndex > 0) {
          setDynamicText(currentPhrase.substring(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        } else {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % phrases.length);
        }
      } else {
        if (charIndex < currentPhrase.length) {
          setDynamicText(currentPhrase.substring(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        } else {
          setTimeout(() => setIsDeleting(true), delayBetweenPhrases);
        }
      }
    };

    const timer = setTimeout(handleTyping, isDeleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, phraseIndex, phrases, isInitialDelay]);


  useEffect(() => {
    async function fetchPosts() {
      try {
        const publishedPosts = await getPublishedPosts(6);
        setPosts(publishedPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
       <section className="text-center py-12 md:py-20">
        <div>
            <h1 className="font-body text-4xl md:text-6xl font-bold tracking-tighter leading-tight h-20 md:h-24">
            {dynamicText}
            <span className="animate-ping">|</span>
            </h1>
            <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-headline">
              O‘z g‘oyalaringizni barcha bilan bo‘lishishga tayyormisiz? Bizning platformamizda har kim o‘z fikrini erkin ifoda eta oladi.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/explore">
                    <Button size="lg" variant="outline" className="font-headline">
                        Barcha insholar
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </Link>
                <Link href="/yozish">
                    <Button size="lg" className="font-headline">
                        Yozishni boshlash
                        <Edit className="ml-2 h-5 w-5" />
                    </Button>
                </Link>
            </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<Edit className="h-8 w-8 text-primary" />}
                title="Insho yozing"
              >
                Inshoyim platformasida o‘z insholaringizni chop eting. Har bir fikr qadrlanadi, har bir yozuv esda qoladi.
              </FeatureCard>
               <FeatureCard 
                icon={<BookOpen className="h-8 w-8 text-primary" />}
                title="Boshqalarning insholarini o‘qing"
              >
                Minglab foydalanuvchilarning insholari sizni kutmoqda. Yangi mavzular, turli yondashuvlar, real hayotiy fikrlar — barchasi shu yerda.
              </FeatureCard>
               <FeatureCard 
                icon={<Globe className="h-8 w-8 text-primary" />}
                title="O‘zbek tilida bilim manbai"
              >
                Inshoyim — o‘zbek tilidagi insholar uchun maxsus platforma. Yozing, o‘qing, baham ko‘ring — barchasi ona tilingizda.
              </FeatureCard>
          </div>
      </section>

      <section>
        <h2 className="font-headline text-3xl font-bold mb-8 text-center md:text-left">So'nggi nashrlar</h2>
        {loading ? (
          <p>Yuklanmoqda...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <EssayCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
