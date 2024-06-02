"use client";

import Tab from "@/components/profile/tab";
import { Button } from "@/components/ui/button";
import { useFollowersCount, useFollowingCount } from "@/lib/hooks/useFollow";
import { usePostsCountByUserId } from "@/lib/hooks/usePost";
import { useUserByUsername } from "@/lib/hooks/useUser";
import { usePageStore } from "@/lib/stores/page";
import { useUserStore } from "@/lib/stores/user";
import dayjs from "dayjs";
import { ArrowLeft, CalendarDays } from "lucide-react";
import Link from "next/link";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import { MouseEvent, useEffect } from "react";

export default function ProfileLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { username: string };
}>) {
  const { username } = params;
  const router = useRouter();
  const { userId } = useUserStore();
  const { setCurrentPage } = usePageStore();
  const segment = useSelectedLayoutSegment();

  const { data: user } = useUserByUsername(username);
  const { data: postsCount } = usePostsCountByUserId(user?.id);
  const { data: followingCount } = useFollowingCount(user?.id);
  const { data: followersCount } = useFollowersCount(user?.id);

  useEffect(() => {
    userId === user?.id ? setCurrentPage("profile") : setCurrentPage("other");
  }, [userId, user?.id, setCurrentPage]);

  return (
    <>
      <div className="sticky top-0 z-[2] flex h-[53px] w-full items-center justify-center bg-white/85 px-2 backdrop-blur">
        <div className="flex min-w-16 flex-col items-start justify-center self-stretch">
          <Button size="sm" variant="ghost">
            <ArrowLeft size={20} />
          </Button>
        </div>
        <div className="flex h-full flex-auto flex-col items-stretch justify-center">
          <h2 className="py-0.5 text-xl font-semibold">{user?.name}</h2>
          <p className="text-xs text-gray-500">
            {postsCount} post{postsCount !== 1 && "s"}
          </p>
        </div>
      </div>
      <div className="flex flex-col">
        <div className="relative w-full bg-gray-300">
          <div className="pb-[33.3%]" />
          {user?.banner && (
            <img
              src={user.banner}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
        </div>
        <div className="mb-4 flex flex-col px-4 pt-3">
          <div className="flex flex-wrap items-start justify-between">
            <div className="relative mb-3 mt-[-15%] w-[25%] min-w-12 rounded-full  border-4 border-white">
              <div className="pb-[100%]" />
              <img
                className="absolute inset-0 h-full w-full rounded-full"
                src={user?.avatar || ""}
                alt={user?.name}
              />
            </div>
            <div className="flex flex-wrap items-end justify-start">
              {userId === user?.id ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="mb-3"
                  onClick={() =>
                    router.push("/settings/profile", { scroll: false })
                  }
                >
                  Edit profile
                </Button>
              ) : (
                <Button size="sm" className="mb-3">
                  Follow
                </Button>
              )}
            </div>
          </div>
          <div className="mb-3 mt-1 flex flex-col">
            <h2 className="text-xl font-semibold">{user?.name}</h2>
            <span className="text-gray-500">@{user?.username}</span>
          </div>
          {user?.bio && <p className="mb-3 text-sm">{user?.bio}</p>}
          <span className="mb-3 text-gray-500">
            <CalendarDays
              size={20}
              className="mr-1 inline-block align-text-bottom"
            />
            Joined {dayjs(user?.created_at).format("MMMM YYYY")}
          </span>
          <div className="flex flex-1 flex-wrap text-sm">
            <Link
              href={`/${username}/following`}
              scroll={false}
              className="mr-5"
            >
              <span className="font-semibold">{followingCount}</span> Following
            </Link>
            <Link href={`/${username}/followers`} scroll={false}>
              <span className="font-semibold">{followersCount}</span> Follower
              {followersCount !== 1 && "s"}
            </Link>
          </div>
        </div>
      </div>
      <nav className="flex border-b text-gray-500">
        <Tab href={`/${username}`} label="Posts" active={segment === null} />
        <Tab
          href={`/${username}/with_replies`}
          label="Replies"
          active={segment === "with_replies"}
        />
        <Tab
          href={`/${username}/likes`}
          label="Likes"
          active={segment === "likes"}
        />
      </nav>
      {children}
    </>
  );
}
