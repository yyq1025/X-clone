"use client";

import NavButton from "@/components/sidebar/nav-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserById } from "@/lib/hooks/useUser";
import { usePageStore } from "@/lib/stores/page";
import { useUserStore } from "@/lib/stores/user";
import { supabase } from "@/lib/supabaseClient";
import { Bell, Bookmark, Ellipsis, Feather, Home, User } from "lucide-react";
import { useRouter } from "next/navigation";

const UserButton: React.FC = () => {
  const logout = () => supabase.auth.signOut();

  const router = useRouter();

  const { currentPage } = usePageStore();

  const { userId } = useUserStore();
  const { data: user } = useUserById(userId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="lg"
          className="my-3 flex h-auto justify-start p-3"
        >
          <Avatar className="size-10">
            <AvatarImage src={user?.avatar || ""} alt={user?.name || ""} />
            <AvatarFallback>
              {user?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="mx-3 hidden flex-auto flex-col items-start font-normal xl:flex">
            <span className="font-semibold">{user?.name}</span>
            <span className="text-gray-500">@{user?.username}</span>
          </div>
          <div className="hidden grow justify-end xl:flex">
            <Ellipsis size={20} />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72">
        <DropdownMenuItem
          onSelect={logout}
          className="cursor-pointer px-4 py-3 font-semibold"
        >
          Log out @{user?.username}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserButton;
