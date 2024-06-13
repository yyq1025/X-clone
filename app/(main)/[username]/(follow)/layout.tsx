"use client";

import BackButton from "@/components/nav/back-button";
import Tab from "@/components/profile/tab";
import { Button } from "@/components/ui/button";
import { useUserByUsername } from "@/lib/hooks/useUser";
import { useSelectedLayoutSegment } from "next/navigation";

export default function FollowLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { username: string };
}) {
  const segment = useSelectedLayoutSegment();
  const { username } = params;
  const { data: user } = useUserByUsername(username);
  return (
    <>
      <div className="sticky top-0 z-[1] flex h-[53px] w-full items-center justify-center bg-white/85 px-4 backdrop-blur">
        <div className="flex min-w-14 items-center">
          <BackButton />
        </div>
        <div className="flex h-full flex-auto flex-col items-stretch justify-center">
          <h2 className="py-0.5 text-xl font-semibold">{user?.name}</h2>
          <p className="text-xs text-gray-500">@{user?.username}</p>
        </div>
      </div>
      <nav className="flex border-b text-gray-500">
        <Tab
          href={`/${username}/followers`}
          label="Follwers"
          active={segment === "followers"}
        />
        <Tab
          href={`/${username}/following`}
          label="Following"
          active={segment === "following"}
        />
      </nav>
      {children}
    </>
  );
}
