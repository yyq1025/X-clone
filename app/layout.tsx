"use client";

import "./globals.css";

import { queryClient } from "@/lib/queryClient";
import { useUserStore } from "@/lib/stores/user";
import { supabase } from "@/lib/supabaseClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Inter } from "next/font/google";
import { ReactNode, useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
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
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>
          {loading ? <div>loading...</div> : children}
        </QueryClientProvider>
      </body>
    </html>
  );
}
