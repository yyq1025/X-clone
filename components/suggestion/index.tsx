import People from "@/components/people/people";
import { useTopUsers } from "@/lib/hooks/useUser";
import Link from "next/link";
import { FC } from "react";

const Suggestion: FC = () => {
  const { data: users } = useTopUsers(3);
  return (
    <div className="flex flex-col rounded-xl border">
      <div className="px-4 py-3">
        <h2 className="text-xl font-bold">Who to follow</h2>
      </div>
      {users?.map((user) => (
        <People key={user.id} peopleId={user.id} size="sm" />
      ))}
      <Link href="/i/connect_people" scroll={false}>
        <div className="p-4">
          <p className="text-sm">Show more</p>
        </div>
      </Link>
    </div>
  );
};

export default Suggestion;
