
'use client';

import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserById, updateUserBio, updateUserAvatar } from "@/lib/services/users";
import { getPostsByAuthor } from "@/lib/services/posts";
import type { User, Post } from "@/types";
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EssayCard } from "@/components/EssayCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Edit } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const avatarStyles = ['bottts', 'micah', 'adventurer', 'fun-emoji', 'initials'];

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioContent, setBioContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isAvatarPopoverOpen, setIsAvatarPopoverOpen] = useState(false);

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
        const userData = await getUserById(userId);
        if (!userData) {
          notFound();
          return;
        }
        setUser(userData);
        setBioContent(userData.bio || "");

        // If it's the user's own profile, fetch all posts (published and drafts).
        // Otherwise, only fetch published posts.
        const postsData = await getPostsByAuthor(userId, isOwnProfile);
        setUserPosts(postsData);
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
        toast({ title: "Profil ma'lumotlarini yuklashda xatolik", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    // We need loggedInUser to be set before we can determine if it's their own profile
    if (loggedInUser !== undefined) {
      fetchData();
    }
  }, [userId, toast, isOwnProfile, loggedInUser]);

  const handleSaveBio = async () => {
    if (!user || !loggedInUser || user.id !== loggedInUser.id) return;

    setIsSaving(true);
    try {
      await updateUserBio(user.id, bioContent);
      const updatedUser = { ...user, bio: bioContent };
      setUser(updatedUser);
      // Update localStorage as well
      if (loggedInUser.id === user.id) {
          localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      setIsEditingBio(false);
      toast({ title: "Muvaffaqiyatli!", description: "Bio muvaffaqiyatli yangilandi." });
    } catch (error) {
      console.error("Failed to update bio:", error);
      toast({ title: "Xatolik", description: "Bio'ni yangilashda xatolik yuz berdi.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleAvatarChange = async (style: string) => {
    if (!user) return;
    const newAvatarUrl = `https://api.dicebear.com/8.x/${style}/svg?seed=${encodeURIComponent(user.name)}`;
    try {
      await updateUserAvatar(user.id, newAvatarUrl);
      const updatedUser = { ...user, avatar_url: newAvatarUrl };
      setUser(updatedUser);
       if (loggedInUser?.id === user.id) {
          localStorage.setItem('user', JSON.stringify(updatedUser));
          window.dispatchEvent(new Event('storage')); // Notify other components of the change
       }
      toast({ title: "Muvaffaqiyatli!", description: "Avatar muvaffaqiyatli yangilandi."});
      setIsAvatarPopoverOpen(false);
    } catch (error) {
      console.error("Failed to update avatar:", error);
      toast({ title: "Xatolik!", description: "Avatarni yangilashda xatolik yuz berdi.", variant: "destructive"});
    }
  }


  if (loading) {
    return <div className="text-center py-10">Yuklanmoqda...</div>;
  }
  
  if (!user) {
    return notFound();
  }

  const authorInitials = user.name.split(' ').map(n => n[0]).join('') || 'U';
  
  const publishedPosts = userPosts.filter(post => post.status === 'published');
  const draftPosts = userPosts.filter(post => post.status === 'draft');

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 md:py-16">
      <section className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
          <div className="relative group">
            <Avatar className="h-28 w-28 md:h-40 md:w-40 border-4 border-primary/20">
              <AvatarImage src={user.avatar_url} alt={user.name} data-ai-hint="avatar" />
              <AvatarFallback className="text-4xl">{authorInitials}</AvatarFallback>
            </Avatar>
            {isOwnProfile && (
              <Popover open={isAvatarPopoverOpen} onOpenChange={setIsAvatarPopoverOpen}>
                <PopoverTrigger asChild>
                   <button className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <Edit className="h-8 w-8 text-white" />
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto">
                    <div className="grid grid-cols-5 gap-2">
                        {avatarStyles.map((style) => (
                           <button key={style} onClick={() => handleAvatarChange(style)} className="p-1 rounded-full hover:bg-accent transition-colors">
                             <Avatar className="h-12 w-12">
                                <AvatarImage 
                                    src={`https://api.dicebear.com/8.x/${style}/svg?seed=${encodeURIComponent(user.name)}`}
                                    alt={`${style} avatar`}
                                />
                                <AvatarFallback>{authorInitials}</AvatarFallback>
                             </Avatar>
                           </button>
                        ))}
                    </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        <div className="text-center md:text-left flex-grow">
          <h1 className="font-headline text-4xl md:text-5xl font-bold">{user.name}</h1>
          <p className="mt-2 text-lg text-muted-foreground">{user.email}</p>
          <div className="mt-4 max-w-xl text-foreground/80">
            {isEditingBio ? (
              <div className="space-y-2">
                <Textarea 
                  value={bioContent}
                  onChange={(e) => setBioContent(e.target.value)}
                  rows={4}
                  className="text-base"
                />
                <div className="flex gap-2">
                  <Button onClick={handleSaveBio} disabled={isSaving}>
                    {isSaving ? "Saqlanmoqda..." : "Saqlash"}
                  </Button>
                  <Button variant="ghost" onClick={() => setIsEditingBio(false)} disabled={isSaving}>
                    Bekor qilish
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <p className="flex-grow pt-1">{user.bio || "Bu foydalanuvchi hali bio qo'shmagan."}</p>
                {isOwnProfile && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsEditingBio(true)}
                    className="shrink-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
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
  )
}
