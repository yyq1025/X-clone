"use client";

import Post from "@/components/post/post";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { usePostsByUserId, useRepliesByUserId } from "@/lib/hooks/usePost";

export default function Replies({
  params,
}: {
  params: { profileUserId: string };
}) {
  const { profileUserId } = params;
  const {
    data: replies,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useRepliesByUserId(profileUserId);

  useInfiniteScroll({
    fetchMore: fetchNextPage,
    hasMore: hasNextPage,
    isFetching: isFetchingNextPage,
  });
  return (
    <>
      {replies?.pages.map((page) =>
        page.posts.map((post) => (
          <Post
            key={post.postId}
            postId={post.postId}
            mode="reply"
            className="border-b"
          />
        )),
      )}
    </>
  );
}
