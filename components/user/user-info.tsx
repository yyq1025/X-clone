import FollowButton from "@/components/user/follow-button";
import Name from "@/components/user/name";
import UserAvatar from "@/components/user/user-avatar";
import UserCard from "@/components/user/user-card";
import Username from "@/components/user/username";
import { useUserById } from "@/lib/hooks/useUser";
import { useUserStore } from "@/lib/stores/user";
import { useRouter } from "next/navigation";
import { FC } from "react";

interface UserInfoProps {
  uid: string;
  size?: "sm" | "default";
}

const UserInfo: FC<UserInfoProps> = ({ uid, size = "default" }) => {
  const { userId } = useUserStore();
  const { data: user } = useUserById(uid);
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/${user?.username}`, { scroll: false })}
      className="flex w-full cursor-pointer px-4 py-3 text-sm hover:bg-accent"
    >
      <UserCard uid={user?.id}>
        <UserAvatar uid={user?.id} className="mr-2 size-10" />
      </UserCard>
      <div className="flex grow flex-col">
        <div className="flex items-center justify-between">
          <div className="flex shrink flex-col">
            <UserCard uid={user?.id}>
              <Name uid={user?.id} />
            </UserCard>
            <UserCard uid={user?.id}>
              <Username uid={user?.id} className="text-gray-500" />
            </UserCard>
          </div>
          {userId !== user?.id && <FollowButton uid={user?.id} />}
        </div>
        {size === "default" && user?.bio && (
          <p className="pt-1 text-sm">{user.bio}</p>
        )}
      </div>
    </div>
  );
};

export default UserInfo;
