"use client";

import Post from "@/components/post/post";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { useRepliesByUserId } from "@/lib/hooks/usePost";
import { useUserByUsername } from "@/lib/hooks/useUser";

export default function Replies({ params }: { params: { username: string } }) {
  const { username } = params;
  const { data: user } = useUserByUsername(username);
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
          <Post
            key={post.id}
            postId={post.id}
            mode="withReplyTo"
            className="border-b"
          />
        )),
      )}
    </>
  );
}
