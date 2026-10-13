"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  IdTokenResult
} from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AdminAuthContextType {
  user: User | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  hasAccess: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  user: null,
  isAdmin: false,
  isSuperAdmin: false,
  hasAccess: false,
  isLoading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {}
});

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkClaims = async (currentUser: User) => {
    try {
      const tokenResult: IdTokenResult = await currentUser.getIdTokenResult(true);
      const isAdm = tokenResult.claims.admin === true;
      const isSuper = tokenResult.claims.superAdmin === true;
      setIsAdmin(isAdm);
      setIsSuperAdmin(isSuper);
    } catch (err) {
      console.warn("[AdminAuthContext] Token claims check error:", err);
      setIsAdmin(false);
      setIsSuperAdmin(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await checkClaims(currentUser);
      } else {
        setIsAdmin(false);
        setIsSuperAdmin(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const cred = await signInWithPopup(auth, provider);
      await checkClaims(cred.user);
    } catch (err: any) {
      console.error("[AdminAuthContext] Sign-in error:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    await fbSignOut(auth);
    setUser(null);
    setIsAdmin(false);
    setIsSuperAdmin(false);
  };

  const hasAccess = isAdmin || isSuperAdmin;

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        isAdmin,
        isSuperAdmin,
        hasAccess,
        isLoading,
        signInWithGoogle,
        signOut
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
