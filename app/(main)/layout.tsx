"use client";

import NavButton from "@/components/sidebar/nav-button";
import UserButton from "@/components/sidebar/user-button";
import Suggestion from "@/components/suggestion";
import { Button } from "@/components/ui/button";
import { useUnreadCountByUserId } from "@/lib/hooks/useNotification";
import { useUserById } from "@/lib/hooks/useUser";
import { useUserStore } from "@/lib/stores/user";
import {
  BellIcon as BellOutline,
  BookmarkIcon as BookmarkOutline,
  HomeIcon as HomeOutline,
  UserIcon as UserOutline,
} from "@heroicons/react/24/outline";
import {
  BellIcon as BellSolid,
  BookmarkIcon as BookmarkSolid,
  HomeIcon as HomeSolid,
  UserIcon as UserSolid,
} from "@heroicons/react/24/solid";
import { isEqual } from "lodash";
import { Feather } from "lucide-react";
import { useRouter, useSelectedLayoutSegments } from "next/navigation";
import React, { ReactNode, useEffect } from "react";

export default function MainLayout({
  children,
  modal,
}: Readonly<{
  children: ReactNode;
  modal: ReactNode;
}>) {
  const { replace, push } = useRouter();
  const { userId } = useUserStore();
  const { data: user } = useUserById(userId);
  const { data: unreadCount } = useUnreadCountByUserId(userId);
  const segments = useSelectedLayoutSegments();

  useEffect(() => {
    if (!userId) replace("/");
  }, [userId, replace]);

  return (
    <div className="flex min-h-dvh w-full items-stretch">
      <header className="relative flex grow flex-col items-end">
        <div className="relative flex w-20 flex-col xl:w-64 2xl:ml-[60px]">
          <div className="bg-white-100 fixed flex min-h-full w-20 flex-col justify-between px-2 xl:w-64">
            <div className="mt-2 flex flex-col gap-y-2">
              <NavButton
                href="/home"
                icon={HomeOutline}
                activeIcon={HomeSolid}
                label="Home"
                active={isEqual(segments, ["home"])}
              />
              <NavButton
                href="/notifications"
                icon={BellOutline}
                activeIcon={BellSolid}
                label="Notifications"
                active={isEqual(segments, ["notifications"])}
                badgeCount={unreadCount}
              />
              <NavButton
                href="/i/bookmarks"
                icon={BookmarkOutline}
                activeIcon={BookmarkSolid}
                label="Bookmarks"
                active={isEqual(segments, ["i", "bookmarks"])}
              />
              <NavButton
                href={`/${user?.username}`}
                icon={UserOutline}
                activeIcon={UserSolid}
                label="Profile"
                active={
                  segments[0] === user?.username && segments[1] != "status"
                }
              />
              <Button
                size="lg"
                onClick={() => push("/compose/post", { scroll: false })}
                className="my-4 h-auto p-3"
              >
                <Feather size={28} className="xl:hidden" />
                <span className="hidden text-lg font-semibold xl:block">
                  Post
                </span>
              </Button>
            </div>
            <UserButton />
          </div>
        </div>
      </header>
      <main className="relative flex flex-auto flex-col items-start">
        <div className="flex min-h-full w-full items-stretch justify-between sm:w-[600px] lg:w-[920px] xl:w-[990px] 2xl:w-[1050px]">
          <div className="relative flex w-full max-w-[600px] grow flex-col items-stretch border-x">
            {modal}
            {children}
          </div>
          <div className="relative top-0 mr-[10px] hidden w-[290px] flex-col items-stretch pt-3 lg:flex xl:w-[350px] 2xl:mr-[70px]">
            <Suggestion />
          </div>
        </div>
      </main>
    </div>
  );
}
