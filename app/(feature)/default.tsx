"use client";

import Post from "@/components/post/post";
import PostCreate from "@/components/post/post-create";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { usePostsByParentId } from "@/lib/hooks/usePost";

export default function Default() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    usePostsByParentId(null);

  useInfiniteScroll({
    fetchMore: fetchNextPage,
    hasMore: hasNextPage,
    isFetching: isFetchingNextPage,
  });

  return (
    <>
      <PostCreate className="w-full border-b" />
      {data?.pages.map((page) =>
        page.posts.map((post) => (
          <Post key={post.id} postId={post.id} className="border-b" />
        )),
      )}
    </>
  );
}
