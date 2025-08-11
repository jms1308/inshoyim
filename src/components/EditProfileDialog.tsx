
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/types';
import { updateUserProfile } from '@/lib/services/users';
import { cn } from '@/lib/utils';

const profileFormSchema = z.object({
  name: z.string().min(3, { message: "Ism kamida 3 belgidan iborat bo'lishi kerak." }),
  email: z.string().email({ message: "Yaroqli email manzilini kiriting." }),
  bio: z.string().max(160, { message: "Bio 160 belgidan oshmasligi kerak." }).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface EditProfileDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  user: User;
  onProfileUpdate: (updatedUser: User) => void;
}

const allAvatarStyles = ['adventurer-neutral', 'avataaars', 'big-ears', 'big-smile', 'bottts', 'croodles', 'fun-emoji', 'icons', 'identicon', 'initials', 'lorelei', 'micah', 'miniavs', 'open-peeps', 'personas', 'pixel-art', 'rings', 'shapes', 'thumbs'];

const getRandomAvatarStyles = () => {
    const shuffled = [...allAvatarStyles].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 5);
};


export function EditProfileDialog({ isOpen, setIsOpen, user, onProfileUpdate }: EditProfileDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar_url);
  const { toast } = useToast();

  const avatarStyles = useMemo(() => getRandomAvatarStyles(), [isOpen]); // Regenerate styles when dialog opens
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      bio: user.bio || '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      // Reset form and avatar selection when dialog opens
      form.reset({
        name: user.name,
        email: user.email,
        bio: user.bio || '',
      });
      setSelectedAvatar(user.avatar_url);
    }
  }, [isOpen, user, form]);
  

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSaving(true);
    try {
        const updateData = {
            ...data,
            bio: data.bio || "",
            avatar_url: selectedAvatar,
        };
        const updatedUser = await updateUserProfile(user.id, updateData);
        toast({
            title: "Muvaffaqiyatli!",
            description: "Profilingiz muvaffaqiyatli yangilandi.",
        });
        onProfileUpdate(updatedUser);
        setIsOpen(false);
    } catch (error: any) {
      toast({
        title: "Xatolik!",
        description: error.message || "Profilni yangilashda xatolik yuz berdi.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const currentName = form.watch('name') || user.name;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Profilni tahrirlash</DialogTitle>
          <DialogDescription>
            O'zgartirishlarni kiriting va saqlang.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="space-y-2">
                <FormLabel>Avatar</FormLabel>
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={selectedAvatar} alt={currentName} />
                        <AvatarFallback>{currentName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                     <div className="grid grid-cols-5 gap-2 flex-1">
                        {avatarStyles.map((style) => {
                             const avatarUrl = `https://api.dicebear.com/8.x/${style}/svg?seed=${encodeURIComponent(currentName)}`;
                             return (
                               <button 
                                 key={style} 
                                 type="button"
                                 onClick={() => setSelectedAvatar(avatarUrl)} 
                                 className={cn("p-1 rounded-full hover:bg-accent transition-colors", {
                                     "ring-2 ring-primary": selectedAvatar === avatarUrl
                                 })}
                                >
                                 <Avatar className="h-10 w-10">
                                    <AvatarImage 
                                        src={avatarUrl}
                                        alt={`${style} avatar for ${currentName}`}
                                    />
                                    <AvatarFallback>{currentName?.charAt(0) || 'U'}</AvatarFallback>
                                 </Avatar>
                               </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ism</FormLabel>
                  <FormControl>
                    <Input placeholder="Ismingiz" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Email manzilingiz" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="O'zingiz haqingizda qisqacha..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} disabled={isSaving}>
                    Bekor qilish
                </Button>
                <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Saqlanmoqda..." : "Saqlash"}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

