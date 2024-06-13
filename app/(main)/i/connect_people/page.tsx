"use client";

import BackButton from "@/components/nav/back-button";
import UserInfo from "@/components/user/user-info";
import { useTopUsers } from "@/lib/hooks/useUser";

export default function Connect() {
  const { data: users } = useTopUsers(50);
  return (
    <>
      <div className="sticky top-0 z-[1] flex h-[53px] w-full items-center justify-center bg-white/85 px-4 backdrop-blur">
        <div className="flex min-w-14 items-center">
          <BackButton />
        </div>
        <div className="flex h-full flex-auto flex-col items-stretch justify-center">
          <h2 className="py-0.5 text-xl font-semibold">Connect</h2>
        </div>
      </div>
      <h2 className="px-4 py-3 text-xl font-bold">Suggested for you</h2>
      {users?.map((user) => <UserInfo key={user.id} uid={user.id} />)}
    </>
  );
}
