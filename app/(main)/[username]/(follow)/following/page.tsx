"use client";

import UserInfo from "@/components/user/user-info";
import { useUserFollowing } from "@/lib/hooks/useFollow";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { useUserByUsername } from "@/lib/hooks/useUser";

export default function Following({
  params,
}: {
  params: { username: string };
}) {
  const { username } = params;
  const { data: user } = useUserByUsername(username);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useUserFollowing(user?.id);

  useInfiniteScroll({
    fetchMore: fetchNextPage,
    hasMore: hasNextPage,
    isFetching: isFetchingNextPage,
  });

  return (
    <>
      {data?.pages.map((page) =>
        page.following.map((following) => (
          <UserInfo key={following.users.id} uid={following.users.id} />
        )),
      )}
    </>
  );
}
