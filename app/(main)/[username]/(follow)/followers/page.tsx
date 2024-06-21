"use client";

import UserInfo from "@/components/user/user-info";
import { useUserFollowers } from "@/lib/hooks/useFollow";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { useUserById, useUserIdByUsername } from "@/lib/hooks/useUser";

export default function Followers({
  params,
}: {
  params: { username: string };
}) {
  const { username } = params;
  const { data } = useUserIdByUsername(username);
  const {data: user} = useUserById(data?.id)
  const { data: userFollowers, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useUserFollowers(user?.id);

  useInfiniteScroll({
    fetchMore: fetchNextPage,
    hasMore: hasNextPage,
    isFetching: isFetchingNextPage,
  });

  return (
    <>
      {userFollowers?.pages.map((page) =>
        page.followers.map((follower) => (
          <UserInfo key={follower.users.id} uid={follower.users.id} />
        )),
      )}
    </>
  );
}
