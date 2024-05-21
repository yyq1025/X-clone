"use client";

import PostModal from "@/components/post/post-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { auth } from "@/lib/firebase";
import { useUserById } from "@/lib/hooks/useUser";
import { usePageStore } from "@/lib/stores/page";
import { useUserStore } from "@/lib/stores/user";
import { signOut } from "firebase/auth";
import { Bell, Bookmark, Ellipsis, Feather, Home, User } from "lucide-react";
import { useRouter } from "next/navigation";

import Nav from "./nav";

const Sidebar: React.FC = () => {
  const logout = () => signOut(auth);

  const router = useRouter();

  const { currentPage } = usePageStore();

  const { userId } = useUserStore();
  const { data: user } = useUserById(userId);

  return (
    <div className="relative flex w-20 flex-col xl:w-64 2xl:ml-[60px]">
      <div className="bg-white-100 fixed flex min-h-full w-20 flex-col justify-between xl:w-64">
        <div className="flex flex-col gap-4 p-4">
          <Nav
            links={[
              {
                title: "Home",
                icon: Home,
                variant: currentPage === "home" ? "secondary" : "ghost",
                onClick: () => router.push("/home"),
              },
              {
                title: "Notifications",
                icon: Bell,
                variant:
                  currentPage === "notifications" ? "secondary" : "ghost",
                onClick: () => router.push("/notifications"),
              },
              {
                title: "Bookmarks",
                icon: Bookmark,
                variant: currentPage === "bookmarks" ? "secondary" : "ghost",
                onClick: () => router.push("/bookmarks"),
              },
              {
                title: "Profile",
                icon: User,
                variant: currentPage === "profile" ? "secondary" : "ghost",
                onClick: () => router.push(`/${userId}`),
              },
            ]}
          />
          <PostModal
            renderTrigger={({ buttonProps }) => (
              <Button {...buttonProps} className="w-full">
                <Feather size={20} className="xl:hidden" />
                <span className="hidden xl:block">Post</span>
              </Button>
            )}
          />
        </div>
        <div className="p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex w-full justify-start gap-4"
              >
                <Avatar className="h-5 w-5">
                  <AvatarImage
                    src={user?.avatar || ""}
                    alt={user?.name || ""}
                  />
                  <AvatarFallback>
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden xl:block">{user?.name}</span>
                <Ellipsis size={20} className="ml-auto hidden xl:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <Button variant="ghost" onClick={logout} className="w-full">
                Logout
              </Button>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
