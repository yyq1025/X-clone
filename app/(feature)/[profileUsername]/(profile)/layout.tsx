"use client";

import { Button } from "@/components/ui/button";
import Tab from "@/components/ui/tab";
import { useFollowersCount, useFollowingCount } from "@/lib/hooks/useFollow";
import { usePostsCountByUserId } from "@/lib/hooks/usePost";
import { useUserByUsername } from "@/lib/hooks/useUser";
import { usePageStore } from "@/lib/stores/page";
import { useUserStore } from "@/lib/stores/user";
import dayjs from "dayjs";
import { ArrowLeft, CalendarDays } from "lucide-react";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { useEffect } from "react";

export default function ProfileLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { profileUsername: string };
}>) {
  const { profileUsername } = params;
  const { userId } = useUserStore();
  const { setCurrentPage } = usePageStore();
  const segment = useSelectedLayoutSegment();

  const { data: profileUser } = useUserByUsername(profileUsername);
  const { data: postsCount } = usePostsCountByUserId(profileUser?.id);
  const { data: followingCount } = useFollowingCount(profileUser?.id);
  const { data: followersCount } = useFollowersCount(profileUser?.id);

  useEffect(() => {
    userId === profileUser?.id
      ? setCurrentPage("profile")
      : setCurrentPage("other");
  }, [userId, profileUser?.id, setCurrentPage]);

  return (
    <>
      <div className="sticky top-0 z-[1] flex h-[53px] w-full items-center justify-center bg-white/85 px-2 backdrop-blur">
        <div className="flex min-w-16 flex-col items-start justify-center self-stretch">
          <Button size="sm" variant="ghost">
            <ArrowLeft size={20} />
          </Button>
        </div>
        <div className="flex h-full flex-auto flex-col items-stretch justify-center">
          <h2 className="py-0.5 text-xl font-bold">{profileUser?.name}</h2>
          <p className="text-xs text-gray-500">
            {postsCount} post{postsCount !== 1 && "s"}
          </p>
        </div>
      </div>
      <div className="flex flex-col">
        <div className="relative w-full">
          <div className="pb-[33.3%]" />
          <div className="absolute inset-0 z-[-1] h-full w-full bg-[url('https://pbs.twimg.com/profile_banners/1636470674725257216/1679000255/1080x360')] bg-cover" />
        </div>
        <div className="mb-4 flex flex-col px-4 pt-3">
          <div className="flex flex-wrap items-start justify-between">
            <div className="relative mb-3 mt-[-15%] w-[25%] min-w-12">
              <div className="pb-[100%]" />
              <img
                className="absolute inset-0 h-full w-full rounded-full border-4 border-white"
                src={profileUser?.avatar || ""}
                alt={profileUser?.name}
              />
            </div>
            <div className="flex flex-wrap items-end justify-start">
              <Button variant="outline" size="sm" className="mb-3">
                Edit profile
              </Button>
            </div>
          </div>
          <div className="mb-3 mt-1 flex flex-col">
            <h2 className="text-xl font-bold">{profileUser?.name}</h2>
            <span className="text-gray-500">@{profileUser?.username}</span>
          </div>
          {profileUser?.bio && (
            <p className="mb-3 text-sm">{profileUser?.bio}</p>
          )}
          <span className="mb-3 text-gray-500">
            <CalendarDays
              size={20}
              className="mr-1 inline-block align-text-bottom"
            />
            Joined {dayjs(profileUser?.created_at).format("MMMM YYYY")}
          </span>
          <div className="flex flex-1 flex-wrap text-sm">
            <Link
              href={`/${profileUsername}/following`}
              scroll={false}
              className="mr-5"
            >
              <span className="font-bold">{followingCount}</span> Following
            </Link>
            <Link href={`/${profileUsername}/followers`} scroll={false}>
              <span className="font-bold">{followersCount}</span> Follower
              {followersCount !== 1 && "s"}
            </Link>
          </div>
        </div>
      </div>
      <nav className="flex border-b text-gray-500">
        <Tab
          href={`/${profileUsername}`}
          label="Posts"
          active={segment === null}
        />
        <Tab
          href={`/${profileUsername}/with_replies`}
          label="Replies"
          active={segment === "with_replies"}
        />
        <Tab
          href={`/${profileUsername}/likes`}
          label="Likes"
          active={segment === "likes"}
        />
      </nav>
      {children}
    </>
  );
}
