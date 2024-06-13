import { useFollowingCount } from "@/lib/hooks/useFollow";
import { useUserById } from "@/lib/hooks/useUser";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { FC } from "react";

interface FollowingCountProps {
  uid?: string;
  className?: string;
}

const FollowingCount: FC<FollowingCountProps> = ({ uid, className }) => {
  const { data: user } = useUserById(uid);
  const { data: followingCount } = useFollowingCount(uid);
  return (
    <Link
      href={`/${user?.username}/following`}
      scroll={false}
      onClick={(e) => e.stopPropagation()}
      className={cn("decoration-foreground hover:underline", className)}
    >
      <span className="font-semibold text-foreground">{followingCount}</span>{" "}
      Following
    </Link>
  );
};

export default FollowingCount;
