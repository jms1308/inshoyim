
'use client';

import { notFound, useParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { getUserById, getAllUsers } from "@/lib/services/users";
import { getPostsByAuthor, getPublishedPosts } from "@/lib/services/posts";
import { getAchievements } from "@/lib/services/achievements";
import type { User, Post, Achievement } from "@/types";
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EssayCard } from "@/components/EssayCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trophy } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditProfileDialog } from "@/components/EditProfileDialog";
import { Skeleton } from "@/components/ui/skeleton";

function ProfilePageSkeleton() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 md:py-16 animate-pulse">
        <section className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
            <Skeleton className="w-28 h-28 md:h-40 md:w-40 rounded-full" />
            <div className="text-center md:text-left flex-grow space-y-3">
                <Skeleton className="h-10 w-60 mx-auto md:mx-0" />
                <Skeleton className="h-5 w-48 mx-auto md:mx-0" />
                <Skeleton className="h-5 w-full max-w-md mx-auto md:mx-0" />
                <Skeleton className="h-5 w-3/4 max-w-md mx-auto md:mx-0" />
            </div>
        </section>
        <section>
            <div className="flex justify-center mb-8">
                <Skeleton className="h-10 w-64 rounded-md" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-1">
                        <Skeleton className="h-[300px] w-full rounded-lg" />
                    </div>
                ))}
            </div>
        </section>
    </div>
  )
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [userAchievements, setUserAchievements] = useState<Achievement[]>([]);
  
  const params = useParams();
  const userId = params.id as string;
  const { toast } = useToast();

  const isOwnProfile = loggedInUser?.id === userId;

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setLoggedInUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    async function fetchData() {
      if (!userId) return;
      try {
        setLoading(true);
        const [userData, postsData, allAchievements] = await Promise.all([
          getUserById(userId),
          getPostsByAuthor(userId, isOwnProfile),
          getAchievements()
        ]);
        
        if (!userData) {
          notFound();
          return;
        }
        setUser(userData);
        setUserPosts(postsData);

        const currentUserAchievements = allAchievements.filter(ach => ach.holderId === userId);
        setUserAchievements(currentUserAchievements);

      } catch (error) {
        console.error("Failed to fetch profile data:", error);
        toast({ title: "Profil ma'lumotlarini yuklashda xatolik", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userId, toast, isOwnProfile]);

  const handleProfileUpdate = (updatedUser: User) => {
    setUser(updatedUser);
    if (loggedInUser?.id === updatedUser.id) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('storage'));
    }
  }

  if (loading) {
    return <ProfilePageSkeleton />;
  }
  
  if (!user) {
    return notFound();
  }

  const authorInitials = user.name.split(' ').map(n => n[0]).join('') || 'U';
  
  const publishedPosts = userPosts.filter(post => post.status === 'published');
  const draftPosts = userPosts.filter(post => post.status === 'draft');

  return (
    <>
      {isOwnProfile && user && (
        <EditProfileDialog 
          isOpen={isEditDialogOpen}
          setIsOpen={setIsEditDialogOpen}
          user={user}
          onProfileUpdate={handleProfileUpdate}
        />
      )}
      <div className="container mx-auto max-w-5xl px-4 py-8 md:py-16">
        <section className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
            <div className="relative group">
              <Avatar className="w-28 h-28 md:h-40 md:w-40 border-4 border-primary/20">
                <AvatarImage src={user.avatar_url} alt={user.name} />
                <AvatarFallback className="text-4xl">{authorInitials}</AvatarFallback>
              </Avatar>
            </div>
          <div className="text-center md:text-left flex-grow">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center md:justify-start gap-2 md:gap-4 mb-2">
                <h1 className="font-headline text-4xl md:text-5xl font-bold">{user.name}</h1>
                 {userAchievements.length > 0 && (
                  <Link href="/achievements">
                    <Button variant="ghost" size="icon" className="text-yellow-500 hover:text-yellow-400">
                      <Trophy className="h-7 w-7" />
                      <span className="sr-only">Yutuqlarni ko'rish</span>
                    </Button>
                  </Link>
                )}
                {isOwnProfile && (
                    <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Profilni tahrirlash
                    </Button>
                )}
            </div>
            <p className="mt-2 text-lg text-muted-foreground">{user.email}</p>
            <div className="mt-4 max-w-xl text-foreground/80">
                <p className="flex-grow pt-1">{user.bio || "Bu foydalanuvchi hali bio qo'shmagan."}</p>
            </div>
          </div>
        </section>

        <section>
            <Tabs defaultValue="published" className="w-full">
              <TabsList className={`grid w-full mb-8 ${isOwnProfile ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  <TabsTrigger value="published">Nashrlar ({publishedPosts.length})</TabsTrigger>
                  {isOwnProfile && <TabsTrigger value="drafts">Qoralamalar ({draftPosts.length})</TabsTrigger>}
              </TabsList>
              <TabsContent value="published">
                  {publishedPosts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {publishedPosts.map((post) => (
                      <EssayCard key={post.id} post={post} />
                      ))}
                  </div>
                  ) : (
                  <p className="text-muted-foreground text-center py-10">
                      Bu muallif hali hech qanday insho nashr etmagan.
                  </p>
                  )}
              </TabsContent>
              {isOwnProfile && (
                  <TabsContent value="drafts">
                      {draftPosts.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                          {draftPosts.map((post) => (
                          <EssayCard key={post.id} post={post} />
                          ))}
                      </div>
                      ) : (
                      <p className="text-muted-foreground text-center py-10">
                          Sizda qoralamalar mavjud emas.
                      </p>
                      )}
                  </TabsContent>
              )}
          </Tabs>
        </section>
      </div>
    </>
  )
}
