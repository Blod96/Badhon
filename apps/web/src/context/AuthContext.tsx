"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  IdTokenResult,
  linkWithCredential,
  PhoneAuthProvider,
  ConfirmationResult,
  signInWithPhoneNumber,
  RecaptchaVerifier
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { UserProfile, UserRole, BloodGroup, AffiliationType, AccountStatus } from "@badhon/domain";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  reloadProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  isAdmin: false,
  isSuperAdmin: false,
  isLoading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  reloadProfile: async () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfile = async (firebaseUser: User) => {
    try {
      const tokenResult: IdTokenResult = await firebaseUser.getIdTokenResult(true);
      setIsAdmin(tokenResult.claims.admin === true);
      setIsSuperAdmin(tokenResult.claims.superAdmin === true);

      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        setUserProfile(userDoc.data() as UserProfile);
      } else {
        // Auto-create initial placeholder user document
        const initialProfile: UserProfile = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || "NWU Community Member",
          email: firebaseUser.email || "",
          isPhoneVerified: false,
          bloodGroup: BloodGroup.O_POSITIVE,
          roles: [UserRole.DONOR],
          affiliationType: AffiliationType.NWU_MEMBER,
          affiliationVerified: false,
          division: "Khulna",
          district: "Khulna",
          upazila: "Sonadanga",
          accountStatus: AccountStatus.ACTIVE,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(userDocRef, initialProfile, { merge: true });
        setUserProfile(initialProfile);
      }
    } catch (err) {
      console.warn("[AuthContext] Profile fetch warning:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser);
      } else {
        setUserProfile(null);
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
      await fetchProfile(cred.user);
    } catch (err: any) {
      console.error("[AuthContext] Google Sign-in error:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    await fbSignOut(auth);
    setUser(null);
    setUserProfile(null);
    setIsAdmin(false);
    setIsSuperAdmin(false);
  };

  const reloadProfile = async () => {
    if (auth.currentUser) {
      await fetchProfile(auth.currentUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isAdmin,
        isSuperAdmin,
        isLoading,
        signInWithGoogle,
        signOut,
        reloadProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
