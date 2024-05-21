"use client";

import { Button } from "@/components/ui/button";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { usePostsByUserId, usePostsCountByUserId } from "@/lib/hooks/usePost";
import { useUserById } from "@/lib/hooks/useUser";
import { usePageStore } from "@/lib/stores/page";
import { useUserStore } from "@/lib/stores/user";
import { cn } from "@/lib/utils";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import dayjs from "dayjs";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfileLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { profileUserId: string };
}>) {
  const { profileUserId } = params;
  const { userId } = useUserStore();
  const { setCurrentPage } = usePageStore();

  const { data: user } = useUserById(profileUserId);

  const { data: postsCount } = usePostsCountByUserId(profileUserId);

  useEffect(() => {
    if (userId === profileUserId) {
      setCurrentPage("profile");
    }
  }, [userId, profileUserId, setCurrentPage]);

  const router = useRouter();
  const pathname = usePathname();
  const paths = [
    `/${profileUserId}`,
    `/${profileUserId}/with_replies`,
    `/${profileUserId}/likes`,
  ];

  return (
    <>
      <div className="sticky top-0 z-[1] flex h-[53px] w-full items-center justify-center bg-white/85 px-2 backdrop-blur">
        <div className="flex min-w-16 flex-col items-start justify-center self-stretch">
          <Button size="sm" variant="ghost">
            <ArrowLeft size={20} />
          </Button>
        </div>
        <div className="flex h-full flex-auto flex-col items-stretch justify-center">
          <h2 className="py-0.5 text-xl font-bold">{user?.name}</h2>
          <span className="text-xs text-gray-500">
            {postsCount} post{postsCount !== 1 && "s"}
          </span>
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
                src={user?.avatar || ""}
                alt={user?.name}
              />
            </div>
            <div className="flex flex-wrap items-end justify-start">
              <Button variant="outline" size="sm" className="mb-3">
                Edit profile
              </Button>
            </div>
          </div>
          <div className="mb-3 mt-1 flex flex-col">
            <h2 className="text-xl font-bold">{user?.name}</h2>
            <span className="text-gray-500">@{user?.username}</span>
          </div>
          {user?.bio && <p className="mb-3 text-sm">{user?.bio}</p>}
          <span className="mb-3 text-gray-500">
            <CalendarDays
              size={20}
              className="mr-1 inline-block align-text-bottom"
            />
            Joined {dayjs(user?.createdAt).format("MMMM YYYY")}
          </span>
          <div className="flex flex-1 flex-wrap text-sm">
            <span className="mr-5">
              <span className="font-bold">0</span> Following
            </span>
            <span>
              <span className="font-bold">0</span> Followers
            </span>
          </div>
        </div>
      </div>
      <TabGroup
        selectedIndex={paths.indexOf(pathname)}
        onChange={(index) => router.replace(paths[index])}
      >
        <TabList className="bottom-1 flex border-b text-gray-500">
          <Tab className="grow px-4">
            {({ hover, selected }) => (
              <div
                className={cn(
                  "relative h-[53px]  py-4 font-bold",
                  selected && "text-foreground",
                )}
              >
                Posts
                {selected && (
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-primary" />
                )}
              </div>
            )}
          </Tab>
          <Tab className="grow px-4">
            {({ hover, selected }) => (
              <div
                className={cn(
                  "relative h-[53px]  py-4 font-bold",
                  selected && "text-foreground",
                )}
              >
                Replies
                {selected && (
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-primary" />
                )}
              </div>
            )}
          </Tab>
          <Tab className="h-[53px] grow px-4">
            {({ hover, selected }) => (
              <div
                className={cn(
                  "relative h-[53px]  py-4 font-bold",
                  selected && "text-foreground",
                )}
              >
                Likes
                {selected && (
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-primary" />
                )}
              </div>
            )}
          </Tab>
        </TabList>
      </TabGroup>
      {children}
    </>
  );
}
