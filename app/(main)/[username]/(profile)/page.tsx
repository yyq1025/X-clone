"use client";

import Post from "@/components/post/post";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { usePostsByUserId } from "@/lib/hooks/usePost";
import { useUserById, useUserIdByUsername } from "@/lib/hooks/useUser";

export default function Posts({ params }: { params: { username: string } }) {
  const { username } = params;
  const { data } = useUserIdByUsername(username);
  const { data: user } = useUserById(data?.id);
  const {
    data: posts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePostsByUserId(user?.id);

  useInfiniteScroll({
    fetchMore: fetchNextPage,
    hasMore: hasNextPage,
    isFetching: isFetchingNextPage,
  });

  return (
    <>
      {posts?.pages.map((page) =>
        page.posts.map((post) => (
          <Post key={post.id} postId={post.id} className="border-b" />
        )),
      )}
    </>
  );
}
