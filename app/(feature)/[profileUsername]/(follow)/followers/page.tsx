"use client";

import People from "@/components/people/people";
import { useUserFollowers } from "@/lib/hooks/useFollow";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { useUserByUsername } from "@/lib/hooks/useUser";

export default function Followers({
  params,
}: {
  params: { profileUsername: string };
}) {
  const { profileUsername } = params;
  const { data: profileUser } = useUserByUsername(profileUsername);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useUserFollowers(profileUser?.id);

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
