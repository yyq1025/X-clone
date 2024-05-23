"use client";

import People from "@/components/people/people";
import { Button } from "@/components/ui/button";
import { useTopUsers } from "@/lib/hooks/useUser";
import { ArrowLeft } from "lucide-react";

export default function Connect() {
  const { data: users } = useTopUsers(50);
  return (
    <>
      <div className="sticky top-0 z-[1] flex h-[53px] w-full items-center justify-center bg-white/85 px-2 backdrop-blur">
        <div className="flex min-w-16 flex-col items-start justify-center self-stretch">
          <Button size="sm" variant="ghost">
            <ArrowLeft size={20} />
          </Button>
        </div>
        <div className="flex h-full flex-auto flex-col items-stretch justify-center">
          <h2 className="py-0.5 text-xl font-bold">Connect</h2>
        </div>
      </div>
      <h2 className="px-4 py-3 text-xl font-extrabold">Suggested for you</h2>
      {users?.map((user) => <People key={user.id} peopleId={user.id} />)}
    </>
  );
}
