
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, doc, getDoc, Timestamp, updateDoc } from 'firebase/firestore';
import type { User } from '@/types';

const usersCollection = collection(db, 'users');

const avatarStyles = ['bottts', 'micah', 'adventurer', 'fun-emoji', 'initials', 'adventurer-neutral', 'avataaars', 'big-ears', 'big-smile', 'croodles', 'icons', 'identicon', 'lorelei', 'miniavs', 'open-peeps', 'personas', 'pixel-art', 'rings', 'shapes', 'thumbs'];


const userFromDoc = (doc: any): User => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        created_at: (data.created_at as Timestamp).toDate().toISOString(),
    } as User;
}

export async function createUser(name: string, email: string, password_DO_NOT_STORE_IN_PLAIN_TEXT: string): Promise<User> {
    // Check if user with the same email or name already exists
    const emailQuery = query(usersCollection, where('email', '==', email));
    const emailSnapshot = await getDocs(emailQuery);
    if (!emailSnapshot.empty) {
        throw new Error('Bu email allaqachon mavjud.');
    }

    const nameQuery = query(usersCollection, where('name', '==', name));
    const nameSnapshot = await getDocs(nameQuery);
    if (!nameSnapshot.empty) {
        throw new Error('Bu ism allaqachon mavjud.');
    }
    
    const randomStyle = avatarStyles[Math.floor(Math.random() * avatarStyles.length)];

    const newUser = {
        name,
        email,
        password: password_DO_NOT_STORE_IN_PLAIN_TEXT, // WARNING: Storing plain text passwords is a security risk.
        avatar_url: `https://api.dicebear.com/8.x/${randomStyle}/svg?seed=${encodeURIComponent(name)}`,
        created_at: new Date(),
        bio: 'Yangi foydalanuvchi',
    };

    const docRef = await addDoc(usersCollection, newUser);
    return {
        id: docRef.id,
        ...newUser,
        created_at: newUser.created_at.toISOString(),
    };
}


export async function getUserByEmailOrName(identifier: string): Promise<User | null> {
    if (!identifier) return null;
    let q;
    if (identifier.includes('@')) {
        q = query(usersCollection, where('email', '==', identifier));
    } else {
        q = query(usersCollection, where('name', '==', identifier));
    }

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return null;
    }
    
    return userFromDoc(snapshot.docs[0]);
}

export async function getUserById(id: string): Promise<User | null> {
    if (!id) return null;
    const userDocRef = doc(db, 'users', id);
    const snapshot = await getDoc(userDocRef);

    if (snapshot.exists()) {
        return userFromDoc(snapshot);
    } else {
        return null;
    }
}

export async function getAllUsers(): Promise<User[]> {
    const snapshot = await getDocs(usersCollection);
    return snapshot.docs.map(doc => userFromDoc(doc));
}


export async function updateUserBio(userId: string, newBio: string): Promise<void> {
    if (!userId) return;
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
        bio: newBio
    });
}

export async function updateUserAvatar(userId: string, avatarUrl: string): Promise<void> {
  if (!userId) return;
  const userDocRef = doc(db, 'users', userId);
  await updateDoc(userDocRef, {
    avatar_url: avatarUrl
  });
}

interface UpdateProfileData {
    name: string;
    email: string;
    bio: string;
    avatar_url: string;
}

export async function updateUserProfile(userId: string, data: UpdateProfileData): Promise<User> {
    if (!userId) throw new Error("Foydalanuvchi IDsi berilmagan.");

    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
        throw new Error("Foydalanuvchi topilmadi.");
    }
    const currentUser = userFromDoc(userSnap);

    // Check if new name or email is already taken by another user
    if (data.name !== currentUser.name) {
        const nameQuery = query(usersCollection, where('name', '==', data.name));
        const nameSnapshot = await getDocs(nameQuery);
        if (!nameSnapshot.empty) {
            throw new Error("Bu ism allaqachon mavjud.");
        }
    }
    if (data.email !== currentUser.email) {
        const emailQuery = query(usersCollection, where('email', '==', data.email));
        const emailSnapshot = await getDocs(emailQuery);
        if (!emailSnapshot.empty) {
            throw new Error("Bu email allaqachon mavjud.");
        }
    }
    
    await updateDoc(userRef, {
        name: data.name,
        email: data.email,
        bio: data.bio,
        avatar_url: data.avatar_url
    });

    const updatedUserSnap = await getDoc(userRef);
    return userFromDoc(updatedUserSnap);
}
