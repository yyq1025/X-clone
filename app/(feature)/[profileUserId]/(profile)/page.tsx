"use client";

import Post from "@/components/post/post";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { usePostsByUserId } from "@/lib/hooks/usePost";

export default function Posts({
  params,
}: {
  params: { profileUserId: string };
}) {
  const { profileUserId } = params;
  const {
    data: posts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePostsByUserId(profileUserId);

  useInfiniteScroll({
    fetchMore: fetchNextPage,
    hasMore: hasNextPage,
    isFetching: isFetchingNextPage,
  });
  return (
    <>
      {posts?.pages.map((page) =>
        page.posts.map((post) => (
          <Post key={post.postId} postId={post.postId} className="border-b" />
        )),
      )}
    </>
  );
}
