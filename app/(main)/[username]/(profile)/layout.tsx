"use client";

import BackButton from "@/components/nav/back-button";
import Tab from "@/components/profile/tab";
import { Button } from "@/components/ui/button";
import FollowButton from "@/components/user/follow-button";
import FollowerCount from "@/components/user/follower-count";
import FollowingCount from "@/components/user/following-count";
import { usePostsCountByUserId } from "@/lib/hooks/usePost";
import { useUserByUsername } from "@/lib/hooks/useUser";
import { useUserStore } from "@/lib/stores/user";
import { CalendarDaysIcon, MapPinIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";

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
  const segment = useSelectedLayoutSegment();

  const { data: user } = useUserByUsername(username);
  const { data: postsCount } = usePostsCountByUserId(user?.id);

  return (
    <>
      <div className="sticky top-0 z-[2] flex h-[53px] w-full items-center justify-center bg-white/85 px-4 backdrop-blur">
        <div className="flex min-w-14 items-center">
          <BackButton />
        </div>
        <div className="flex h-full flex-auto flex-col items-stretch justify-center">
          <h2 className="py-0.5 text-xl font-semibold">{user?.name}</h2>
          <p className="text-xs text-gray-500">
            {postsCount} post{postsCount !== 1 && "s"}
          </p>
        </div>
      </div>
      <div className="flex flex-col text-sm">
        <div className="relative w-full bg-gray-300">
          <div className="pb-[33.3%]" />
          {user?.banner && (
            <img
              src={user.banner}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
        </div>
        <div className="mb-4 flex flex-col px-4 pt-3 text-gray-500">
          <div className="flex flex-wrap items-start justify-between">
            <div className="relative mb-3 mt-[-15%] w-[25%] min-w-12 rounded-full  border-4 border-white">
              <div className="pb-[100%]" />
              <img
                className="absolute inset-0 h-full w-full rounded-full"
                src={user?.avatar || ""}
                alt={user?.name}
              />
            </div>
            <div className="flex flex-wrap items-end justify-start text-foreground">
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
                <FollowButton uid={user?.id} />
              )}
            </div>
          </div>
          <div className="mb-3 mt-1 flex flex-col">
            <h2 className="text-xl font-semibold text-foreground">{user?.name}</h2>
            <span>@{user?.username}</span>
          </div>
          {user?.bio && <p className="mb-3 text-foreground">{user?.bio}</p>}
          <div className="mb-3 inline">
            {!!user?.location && (
              <span className="mr-3">
                <MapPinIcon className="mr-1 inline-block size-5 stroke-2 align-text-bottom" />
                {user?.location}
              </span>
            )}
            <span>
              <CalendarDaysIcon className="mr-1 inline-block size-5 stroke-2 align-text-bottom" />
              Joined {dayjs(user?.created_at).format("MMMM YYYY")}
            </span>
          </div>
          <div className="flex flex-1 flex-wrap">
            <FollowingCount uid={user?.id} className="mr-5"/>
            <FollowerCount uid={user?.id} />
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
