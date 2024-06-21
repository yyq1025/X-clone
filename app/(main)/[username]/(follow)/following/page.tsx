"use client";

import UserInfo from "@/components/user/user-info";
import { useUserFollowing } from "@/lib/hooks/useFollow";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { useUserById, useUserIdByUsername } from "@/lib/hooks/useUser";

export default function Following({
  params,
}: {
  params: { username: string };
}) {
  const { username } = params;
  const { data } = useUserIdByUsername(username);
  const {data: user} = useUserById(data?.id)
  const { data: userFollowing, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useUserFollowing(user?.id);

  useInfiniteScroll({
    fetchMore: fetchNextPage,
    hasMore: hasNextPage,
    isFetching: isFetchingNextPage,
  });

  return (
    <>
      {userFollowing?.pages.map((page) =>
        page.following.map((following) => (
          <UserInfo key={following.users.id} uid={following.users.id} />
        )),
      )}
    </>
  );
}
