"use client";

import People from "@/components/people/people";
import { useUserFollowers } from "@/lib/hooks/useFollow";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { useUserByUsername } from "@/lib/hooks/useUser";

export default function Followers({
  params,
}: {
  params: { username: string };
}) {
  const { username } = params;
  const { data: user } = useUserByUsername(username);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useUserFollowers(user?.id);

  useInfiniteScroll({
    fetchMore: fetchNextPage,
    hasMore: hasNextPage,
    isFetching: isFetchingNextPage,
  });

  return (
    <>
      {data?.pages.map((page) =>
        page.followers.map((follower) => (
          <People key={follower.users.id} peopleId={follower.users.id} />
        )),
      )}
    </>
  );
}
