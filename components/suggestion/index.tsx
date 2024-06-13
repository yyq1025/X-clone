import UserInfo from "@/components/user/user-info";
import { useTopUsers } from "@/lib/hooks/useUser";
import Link from "next/link";
import { FC } from "react";

const Suggestion: FC = () => {
  const { data: users } = useTopUsers(3);
  return (
    <div className="fixed flex w-[290px] flex-col overflow-hidden rounded-xl border xl:w-[350px]">
      <div className="px-4 py-3">
        <h2 className="text-xl font-bold">Who to follow</h2>
      </div>
      {users?.map((user) => <UserInfo key={user.id} uid={user.id} size="sm" />)}
      <Link
        href="/i/connect_people"
        scroll={false}
        className="p-4 hover:bg-accent"
      >
        <p className="text-sm">Show more</p>
      </Link>
    </div>
  );
};

export default Suggestion;
