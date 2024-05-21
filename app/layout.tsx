"use client";

import { auth } from "@/lib/firebase";
import { useAddUser } from "@/lib/hooks/useUser";
import { queryClient } from "@/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Inter } from "next/font/google";

import "./globals.css";

import { useUserStore } from "@/lib/stores/user";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { loading, setLoading, setUserId } = useUserStore();
  const addUser = useAddUser();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const { uid, displayName, photoURL } = user;
        await addUser.mutateAsync({ uid, displayName, photoURL });
        setUserId(user.uid);
      } else {
        setUserId("");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <html lang="en">
      <body className={inter.className}>
        {loading ? <div>loading...</div> : children}
      </body>
    </html>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryClientProvider client={queryClient}>
      <Layout>{children}</Layout>
    </QueryClientProvider>
  );
}
