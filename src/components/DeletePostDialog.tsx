'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { deletePost } from '@/lib/services/posts';

interface DeletePostDialogProps {
  postId: string;
  onPostDeleted: () => void;
  children: React.ReactNode;
}

export function DeletePostDialog({ postId, onPostDeleted, children }: DeletePostDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deletePost(postId);
      onPostDeleted();
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to delete post:', error);
      toast({
        title: 'Xatolik!',
        description: "Inshoni o'chirishda xatolik yuz berdi.",
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Haqiqatan ham ishonchingiz komilmi?</AlertDialogTitle>
          <AlertDialogDescription>
            Bu amalni qaytarib bo'lmaydi. Bu sizning inshongizni serverlarimizdan butunlay o'chirib tashlaydi.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Bekor qilish</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "O'chirilmoqda..." : "Ha, o'chirish"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
