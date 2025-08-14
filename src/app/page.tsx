
'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { EssayCard } from '@/components/EssayCard';
import { usePosts } from '@/context/PostContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, Edit, BookOpen, Globe } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import { useRouter } from 'next/navigation';

const FeatureCard = ({ icon, title, children, index = 0, className }: { icon: React.ReactNode, title: string, children: React.ReactNode, index?: number, className?: string }) => {
    const [isVisible, setIsVisible] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, index * 150);
        return () => clearTimeout(timer);
    }, [index]);
    
    useEffect(() => {
        const card = cardRef.current;
        if (!card) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        };

        card.addEventListener('mousemove', handleMouseMove);

        return () => {
            card.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);


    return (
        <div
            ref={cardRef}
            className={cn(
                "relative p-8 rounded-2xl overflow-hidden transform-gpu transition-all duration-500 ease-out group border",
                "before:absolute before:inset-0 before:z-0 before:bg-[radial-gradient(400px_circle_at_var(--mouse-x)_var(--mouse-y),_rgba(255,255,255,0.2),_transparent_40%)] before:opacity-0 before:transition-opacity before:duration-500 group-hover:before:opacity-100",
                isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95",
                className
            )}
        >
            <div className="relative z-10 flex flex-col h-full">
                <div className="mb-4 bg-white/20 p-3 rounded-full w-max shadow-lg backdrop-blur-sm">
                    {icon}
                </div>
                <h3 className="font-headline text-2xl font-bold text-card-foreground mb-3">{title}</h3>
                <p className="font-body text-card-foreground/80 flex-grow">{children}</p>
            </div>
        </div>
    );
};


export default function Home() {
  const { posts, loading } = usePosts();
  const latestPosts = useMemo(() => posts.slice(0, 6), [posts]);
  const router = useRouter();
  
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

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
          setDynamicText(phrases[phraseIndex].substring(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        } else {
          setTimeout(() => setIsDeleting(true), delayBetweenPhrases);
        }
      }
    };

    const timer = setTimeout(handleTyping, isDeleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, phraseIndex, isInitialDelay]);
  
  const plugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  )

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
       <section className={cn(
          "text-center py-12 md:py-20 transition-all duration-700 ease-out",
          isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
        )}>
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
                icon={<Edit className="h-8 w-8 text-purple-700" />}
                title="Insho yozing"
                index={0}
                className="bg-purple-50 dark:bg-purple-900/20"
              >
                Inshoyim platformasida o‘z insholaringizni chop eting. Har bir fikr qadrlanadi, har bir yozuv esda qoladi.
              </FeatureCard>
               <FeatureCard
                icon={<BookOpen className="h-8 w-8 text-purple-700" />}
                title="Boshqalarni o‘qing"
                index={1}
                className="bg-purple-50 dark:bg-purple-900/20"
              >
                Minglab foydalanuvchilarning insholari sizni kutmoqda. Yangi mavzular, turli yondashuvlar, real hayotiy fikrlar — barchasi shu yerda.
              </FeatureCard>
               <FeatureCard
                icon={<Globe className="h-8 w-8 text-purple-700" />}
                title="O‘zbek tilida bilim manbai"
                index={2}
                className="bg-purple-50 dark:bg-purple-900/20"
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
          <Carousel
            plugins={[plugin.current]}
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
          >
            <CarouselContent>
              {latestPosts.map((post, index) => (
                <CarouselItem key={post.id} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <EssayCard post={post} index={index} onClick={() => router.push(`/posts/${post.id}`)} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 md:-left-4" />
            <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 md:-right-4" />
          </Carousel>
        )}
      </section>
    </div>
  );
}
