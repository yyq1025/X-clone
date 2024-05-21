"use client";

import Post from "@/components/post/post";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { useLikedPostsByUserId } from "@/lib/hooks/useLike";

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
  } = useLikedPostsByUserId(profileUserId);

  useInfiniteScroll({
    fetchMore: fetchNextPage,
    hasMore: hasNextPage,
    isFetching: isFetchingNextPage,
  });
  return (
    <>
      {replies?.pages.map((page) =>
        page.likedPosts.map((post) => (
          <Post
            key={post.post.postId}
            postId={post.post.postId}
            mode="reply"
            className="border-b"
          />
        )),
      )}
    </>
  );
}
