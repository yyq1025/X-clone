"use client";

import Post from "@/components/post/post";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { useRepliesByUserId } from "@/lib/hooks/usePost";
import { useUserById, useUserIdByUsername } from "@/lib/hooks/useUser";

export default function Replies({ params }: { params: { username: string } }) {
  const { username } = params;
  const { data } = useUserIdByUsername(username);
  const { data: user } = useUserById(data?.id);
  const {
    data: replies,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useRepliesByUserId(user?.id);

  useInfiniteScroll({
    fetchMore: fetchNextPage,
    hasMore: hasNextPage,
    isFetching: isFetchingNextPage,
  });

  return (
    <>
      {replies?.pages.map((page) =>
        page.posts.map((post) => (
          <Post key={post.id} postId={post.id} className="border-b" />
        )),
      )}
    </>
  );
}
