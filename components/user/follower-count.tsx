import { useFollowersCount, useFollowingCount } from "@/lib/hooks/useFollow";
import { useUserById } from "@/lib/hooks/useUser";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { FC } from "react";

interface FollowerCountProps {
  uid?: string;
  className?: string;
}

const FollowerCount: FC<FollowerCountProps> = ({ uid, className }) => {
  const { data: user } = useUserById(uid);
  const { data: followersCount } = useFollowersCount(uid);
  return (
    <Link
      href={`/${user?.username}/followers`}
      scroll={false}
      onClick={(e) => e.stopPropagation()}
      className={cn("decoration-foreground hover:underline", className)}
    >
      <span className="font-semibold text-foreground">{followersCount}</span>{" "}
      Follower{followersCount !== 1 && "s"}
    </Link>
  );
};

export default FollowerCount;
