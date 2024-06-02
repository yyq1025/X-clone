"use client";

import NavButton from "@/components/sidebar/nav-button";
import UserButton from "@/components/sidebar/user-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUnreadCountByUserId } from "@/lib/hooks/useNotification";
import { useUserById } from "@/lib/hooks/useUser";
import { usePageStore } from "@/lib/stores/page";
import { useUserStore } from "@/lib/stores/user";
import { supabase } from "@/lib/supabaseClient";
import { Bell, Bookmark, Ellipsis, Feather, Home, User } from "lucide-react";
import { useRouter } from "next/navigation";

const Sidebar: React.FC = () => {
  const logout = () => supabase.auth.signOut();

  const router = useRouter();

  const { currentPage } = usePageStore();

  const { userId } = useUserStore();
  const { data: user } = useUserById(userId);
  const { data: unreadCount } = useUnreadCountByUserId(userId);

  return (
    <div className="relative flex w-20 flex-col xl:w-64 2xl:ml-[60px]">
      <div className="bg-white-100 fixed flex min-h-full w-20 flex-col justify-between px-2 xl:w-64">
        <div className="mt-2 flex flex-col gap-y-2">
          <NavButton href="/home" icon={Home} label="Home" active={true} />
          <NavButton
            href="/notifications"
            icon={Bell}
            label="Notifications"
            active={false}
            badgeCount={unreadCount}
          />
          <NavButton
            href="/i/bookmarks"
            icon={Bookmark}
            label="Bookmarks"
            active={false}
          />
          <NavButton
            href={`/${user?.username}`}
            icon={User}
            label="Profile"
            active={false}
          />
          <Button
            size="lg"
            onClick={() => router.push("/compose/post", { scroll: false })}
            className="my-4 h-auto p-3"
          >
            <Feather size={24} className="xl:hidden" />
            <span className="hidden text-base font-semibold xl:block">
              Post
            </span>
          </Button>
        </div>
        <UserButton />
      </div>
    </div>
  );
};

export default Sidebar;
