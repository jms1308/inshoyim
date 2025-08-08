'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, doc, getDoc, Timestamp } from 'firebase/firestore';
import type { User } from '@/types';

const usersCollection = collection(db, 'users');

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

    const newUser = {
        name,
        email,
        password: password_DO_NOT_STORE_IN_PLAIN_TEXT, // WARNING: Storing plain text passwords is a security risk.
        avatar_url: `https://api.dicebear.com/8.x/lorelei/svg?seed=${encodeURIComponent(name)}`,
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
    const userDoc = doc(db, 'users', id);
    const snapshot = await getDoc(userDoc);

    if (snapshot.exists()) {
        return userFromDoc(snapshot);
    } else {
        return null;
    }
}
