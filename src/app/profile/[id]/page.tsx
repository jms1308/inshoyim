
'use client';

import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserById, updateUserBio } from "@/lib/services/users";
import { getPostsByAuthor } from "@/lib/services/posts";
import type { User, Post } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EssayCard } from "@/components/EssayCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Edit } from "lucide-react";

export default function ProfilePage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<User | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioContent, setBioContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const userId = params.id;
  const { toast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setLoggedInUser(JSON.parse(storedUser));
    }

    async function fetchData() {
      if (!userId) return;
      try {
        const userData = await getUserById(userId);
        if (!userData) {
          notFound();
          return;
        }
        setUser(userData);
        setBioContent(userData.bio || "");

        const postsData = await getPostsByAuthor(userId);
        setUserPosts(postsData);
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
        toast({ title: "Profil ma'lumotlarini yuklashda xatolik", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userId, toast]);

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

  if (loading) {
    return <div className="text-center py-10">Yuklanmoqda...</div>;
  }
  
  if (!user) {
    return notFound();
  }

  const authorInitials = user.name.split(' ').map(n => n[0]).join('') || 'U';
  const isOwnProfile = loggedInUser?.id === user.id;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 md:py-16">
      <section className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
        <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-primary/20">
          <AvatarImage src={user.avatar_url} alt={user.name} data-ai-hint="avatar" />
          <AvatarFallback className="text-4xl">{authorInitials}</AvatarFallback>
        </Avatar>
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
              <div className="relative group">
                <p>{user.bio || "Bu foydalanuvchi hali bio qo'shmagan."}</p>
                {isOwnProfile && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsEditingBio(true)}
                    className="absolute -top-2 -right-10 opacity-0 group-hover:opacity-100 transition-opacity"
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
        <h2 className="font-headline text-3xl font-bold mb-8 border-b pb-4">
          Nashrlar
        </h2>
        {userPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {userPosts.map((post) => (
              <EssayCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-10">
            Bu muallif hali hech qanday insho nashr etmagan.
          </p>
        )}
      </section>
    </div>
  )
}
    
