import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import FollowButton from "@/components/user/follow-button";
import FollowerCount from "@/components/user/follower-count";
import FollowingCount from "@/components/user/following-count";
import Name from "@/components/user/name";
import UserAvatar from "@/components/user/user-avatar";
import Username from "@/components/user/username";
import { useUserById } from "@/lib/hooks/useUser";
import { useUserStore } from "@/lib/stores/user";
import { FC, ReactNode } from "react";

interface UserCardProps {
  uid?: string;
  children: ReactNode;
}

const UserCard: FC<UserCardProps> = ({ uid, children }) => {
  const { userId } = useUserStore();
  const { data: cardUser } = useUserById(uid);

  return (
    <HoverCard>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent
        sideOffset={8}
        className="flex w-[300px] cursor-auto flex-col text-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between">
          <UserAvatar uid={uid} className="size-16" />
          {userId != uid && <FollowButton uid={uid} />}
        </div>
        <Name uid={uid} className="mt-2 text-base" />
        <Username uid={uid} className="text-gray-500" />
        {!!cardUser?.bio && <p className="mt-3">{cardUser?.bio}</p>}
        <div className="mt-3 flex text-gray-500">
          <FollowingCount uid={uid} className="mr-5" />
          <FollowerCount uid={uid} />
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default UserCard;
