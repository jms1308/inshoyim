
'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { EssayCard } from '@/components/EssayCard';
import { usePosts } from '@/context/PostContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, Edit, BookOpen, Globe } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
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
import { Skeleton } from '@/components/ui/skeleton';

const FeatureCard = ({ icon, title, children, index = 0, className }: { icon: React.ReactNode, title: string, children: React.ReactNode, index?: number, className?: string }) => {
    const cardRef = useRef<HTMLDivElement>(null);

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
            style={{ animationDelay: `${index * 150}ms`}}
            className={cn(
                "relative p-8 rounded-2xl overflow-hidden transform-gpu transition-all duration-500 ease-out group border shadow-md hover:shadow-2xl transition-shadow",
                "before:absolute before:inset-0 before:z-0 before:bg-[radial-gradient(400px_circle_at_var(--mouse-x)_var(--mouse-y),_rgba(255,255,255,0.2),_transparent_40%)] before:opacity-0 before:transition-opacity before:duration-500 group-hover:before:opacity-100",
                "animate-fade-in-up",
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

function EssayCardSkeleton() {
  return (
    <div className="p-1">
      <Card className="flex flex-col h-full">
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent className="flex-grow space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-4">
          <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-12" />
              </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

function AnimatedBackground() {
    return (
        <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
            {/* Light mode */}
            <div className="block dark:hidden">
                <div className="sun"></div>
                <div className="cloud cloud-1" style={{ top: '20%', left: '10%' }}></div>
            </div>
            {/* Dark mode */}
            <div className="hidden dark:block">
                 <div className="moon"></div>
                 <div className="star" style={{ top: '10%', left: '25%', width: '2px', height: '2px', animationDelay: '0s' }}></div>
                 <div className="star" style={{ top: '20%', left: '80%', width: '3px', height: '3px', animationDelay: '1s' }}></div>
                 <div className="star" style={{ top: '30%', left: '10%', width: '1px', height: '1px', animationDelay: '2s' }}></div>
                 <div className="star" style={{ top: '40%', left: '90%', width: '2px', height: '2px', animationDelay: '0.5s' }}></div>
                 <div className="star" style={{ top: '50%', left: '50%', width: '2px', height: '2px', animationDelay: '3s' }}></div>
                 <div className="star" style={{ top: '60%', left: '15%', width: '1px', height: '1px', animationDelay: '1.5s' }}></div>
                 <div className="star" style={{ top: '70%', left: '75%', width: '3px', height: '3px', animationDelay: '2.5s' }}></div>
                 <div className="star" style={{ top: '80%', left: '30%', width: '2px', height: '2px', animationDelay: '1.2s' }}></div>
                 <div className="star" style={{ top: '90%', left: '60%', width: '1px', height: '1px', animationDelay: '0.2s' }}></div>
                 <div className="star" style={{ top: '15%', left: '5%', width: '1px', height: '1px', animationDelay: '3.8s' }}></div>
                 <div className="star" style={{ top: '25%', left: '95%', width: '2px', height: '2px', animationDelay: '1.8s' }}></div>
                 <div className="star" style={{ top: '35%', left: '20%', width: '3px', height: '3px', animationDelay: '0.8s' }}></div>
                 <div className="star" style={{ top: '45%', left: '70%', width: '1px', height: '1px', animationDelay: '2.2s' }}></div>
                 <div className="star" style={{ top: '55%', left: '40%', width: '2px', height: '2px', animationDelay: '1.4s' }}></div>
                 <div className="star" style={{ top: '65%', left: '85%', width: '1px', height: '1px', animationDelay: '3.5s' }}></div>
                 <div className="star" style={{ top: '75%', left: '5%', width: '3px', height: '3px', animationDelay: '0.4s' }}></div>
                 <div className="star" style={{ top: '85%', left: '55%', width: '2px', height: '2px', animationDelay: '2.8s' }}></div>
                 <div className="star" style={{ top: '95%', left: '25%', width: '1px', height: '1px', animationDelay: '1.3s' }}></div>
                 <div className="star" style={{ top: '5%', left: '50%', width: '2px', height: '2px', animationDelay: '0.7s' }}></div>
                 <div className="star" style={{ top: '12%', left: '35%', width: '1px', height: '1px', animationDelay: '2.1s' }}></div>
                 <div className="star" style={{ top: '22%', left: '65%', width: '2px', height: '2px', animationDelay: '3.2s' }}></div>
                 <div className="star" style={{ top: '33%', left: '85%', width: '3px', height: '3px', animationDelay: '0.1s' }}></div>
                 <div className="star" style={{ top: '48%', left: '15%', width: '1px', height: '1px', animationDelay: '1.9s' }}></div>
                 <div className="star" style={{ top: '58%', left: '75%', width: '2px', height: '2px', animationDelay: '2.4s' }}></div>
            </div>
        </div>
    );
}

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
    <div className="relative isolate">
      <AnimatedBackground />
      <div className="container mx-auto px-4 py-8 md:py-12 relative z-10">
        <section className="text-center py-24 md:py-20 animate-fade-in-up">
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
                      <Button size="lg" variant="outline" className="font-headline shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all rounded-full">
                          Barcha insholar
                          <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                  </Link>
                  <Link href="/yozish">
                      <Button size="lg" className="font-headline shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all rounded-full">
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
                  icon={<Edit className="h-8 w-8 text-purple-700 dark:text-white" />}
                  title="Insho yozing"
                  index={0}
                  className="bg-purple-50 dark:bg-secondary"
                >
                  Inshoyim platformasida o‘z insholaringizni chop eting. Har bir fikr qadrlanadi, har bir yozuv esda qoladi.
                </FeatureCard>
                <FeatureCard
                  icon={<BookOpen className="h-8 w-8 text-purple-700 dark:text-white" />}
                  title="Boshqalarni o‘qing"
                  index={1}
                  className="bg-purple-50 dark:bg-secondary"
                >
                  Minglab foydalanuvchilarning insholari sizni kutmoqda. Yangi mavzular, turli yondashuvlar, real hayotiy fikrlar — barchasi shu yerda.
                </FeatureCard>
                <FeatureCard
                  icon={<Globe className="h-8 w-8 text-purple-700 dark:text-white" />}
                  title="O‘zbek tilida bilim manbai"
                  index={2}
                  className="bg-purple-50 dark:bg-secondary"
                >
                  Inshoyim — o‘zbek tilidagi insholar uchun maxsus platforma. Yozing, o‘qing, baham ko‘ring — barchasi ona tilingizda.
                </FeatureCard>
            </div>
        </section>

        <section>
          <h2 className="font-headline text-3xl font-bold mb-8 text-center md:text-left">So'nggi nashrlar</h2>
          {loading ? (
            <Carousel
              opts={{ align: "start", loop: false }}
              className="w-full"
            >
              <CarouselContent>
                {Array.from({ length: 3 }).map((_, index) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                    <EssayCardSkeleton />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 md:-left-4" />
              <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 md:-right-4" />
            </Carousel>
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
                    <div className="p-1 h-full">
                      <EssayCard post={post} className="h-full" />
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
    </div>
  );
}
