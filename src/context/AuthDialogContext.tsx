'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AuthDialogContextType {
  isLoginOpen: boolean;
  setLoginOpen: (isOpen: boolean) => void;
  isRegisterOpen: boolean;
  setRegisterOpen: (isOpen: boolean) => void;
}

const AuthDialogContext = createContext<AuthDialogContextType | undefined>(undefined);

export function AuthDialogProvider({ children }: { children: ReactNode }) {
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isRegisterOpen, setRegisterOpen] = useState(false);

  const value = {
    isLoginOpen,
    setLoginOpen,
    isRegisterOpen,
    setRegisterOpen,
  };

  return (
    <AuthDialogContext.Provider value={value}>
      {children}
    </AuthDialogContext.Provider>
  );
}

export function useAuthDialog() {
  const context = useContext(AuthDialogContext);
  if (context === undefined) {
    throw new Error('useAuthDialog must be used within an AuthDialogProvider');
  }
  return context;
}
