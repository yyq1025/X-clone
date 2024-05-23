"use client";

import { queryClient } from "@/lib/queryClient";
import { supabase } from "@/lib/supabaseClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Inter } from "next/font/google";

import "./globals.css";

import { useUserStore } from "@/lib/stores/user";
import { ReactNode, useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

function Layout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const { loading, setLoading, setUserId } = useUserStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user.id);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id);
    });

    return () => subscription.unsubscribe();
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
  children: ReactNode;
}>) {
  return (
    <QueryClientProvider client={queryClient}>
      <Layout>{children}</Layout>
    </QueryClientProvider>
  );
}
