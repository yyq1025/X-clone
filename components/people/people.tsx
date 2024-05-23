import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useFollow, useFollowed, useUnfollow } from "@/lib/hooks/useFollow";
import { useUserById } from "@/lib/hooks/useUser";
import { useUserStore } from "@/lib/stores/user";
import Link from "next/link";
import { FC, MouseEvent } from "react";

interface PeopleProps {
  peopleId: string;
  size?: "sm" | "default";
}

const People: FC<PeopleProps> = ({ peopleId, size = "default" }) => {
  const { userId } = useUserStore();
  const { data: people } = useUserById(peopleId);
  const { data: followed } = useFollowed({
    followerId: userId,
    followingId: people?.id,
  });

  const follow = useFollow();
  const handleFollow = (event: MouseEvent) => {
    event.preventDefault();
    userId &&
      people &&
      follow.mutate({ followerId: userId, followingId: people.id });
  };

  const unfollow = useUnfollow();
  const handleUnfollow = (event: MouseEvent) => {
    event.preventDefault();
    userId &&
      people &&
      unfollow.mutate({ followerId: userId, followingId: people.id });
  };

  return (
    <Link
      href={`/${people?.username}`}
      scroll={false}
      className="flex w-full px-4 py-3"
    >
      <Avatar className="mr-2 h-10 w-10">
        <AvatarImage src={people?.avatar || ""} alt={people?.name || ""} />
        <AvatarFallback>{people?.name.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex grow flex-col">
        <div className="flex items-center justify-between">
          <div className="flex shrink flex-col">
            <p className="text-sm font-semibold">{people?.name}</p>
            <p className="text-xs text-gray-500">@{people?.username}</p>
          </div>
          {userId !== people?.id &&
            (followed ? (
              <Button size="sm" onClick={handleUnfollow}>
                Unfollow
              </Button>
            ) : (
              <Button size="sm" onClick={handleFollow}>
                Follow
              </Button>
            ))}
        </div>
        {size === "default" && people?.bio && (
          <p className="text-sm">{people.bio}</p>
        )}
      </div>
    </Link>
  );
};

export default People;
