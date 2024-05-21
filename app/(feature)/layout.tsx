"use client";

import Sidebar from "@/components/sidebar";
import { useUserStore } from "@/lib/stores/user";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (!userId) router.replace("/");
  }, [userId]);

  return (
    <div className="flex min-h-dvh w-full items-stretch">
      <header className="relative flex grow flex-col items-end">
        <Sidebar />
      </header>
      <main className="relative flex flex-auto flex-col items-start">
        <div className="flex min-h-full w-full items-stretch justify-between sm:w-[600px] lg:w-[920px] xl:w-[990px] 2xl:w-[1050px]">
          <div className="relative flex w-full max-w-[600px] grow flex-col items-stretch border-x">
            {children}
          </div>
          <div className="mr-[10px] hidden w-[290px] flex-col items-stretch pt-3 lg:flex xl:w-[350px] 2xl:mr-[70px]">
            Who to follow
          </div>
        </div>
      </main>
    </div>
  );
}
