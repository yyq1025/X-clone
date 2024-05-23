"use client";

import Post from "@/components/post/post";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { useRepliesByUserId } from "@/lib/hooks/usePost";
import { useUserByUsername } from "@/lib/hooks/useUser";

export default function Replies({
  params,
}: {
  params: { profileUsername: string };
}) {
  const { profileUsername } = params;
  const { data: profileUser } = useUserByUsername(profileUsername);
  const {
    data: replies,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useRepliesByUserId(profileUser?.id);

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
            mode="reply"
            className="border-b"
          />
        )),
      )}
    </>
  );
}
