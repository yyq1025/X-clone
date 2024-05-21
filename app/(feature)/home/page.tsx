"use client";

import Post from "@/components/post/post";
import PostCreate from "@/components/post/post-create";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { usePostsByParentId } from "@/lib/hooks/usePost";
import { usePageStore } from "@/lib/stores/page";
import { useEffect } from "react";

export default function Home() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    usePostsByParentId(null);

  useInfiniteScroll({
    fetchMore: fetchNextPage,
    hasMore: hasNextPage,
    isFetching: isFetchingNextPage,
  });

  const { setCurrentPage } = usePageStore();

  useEffect(() => {
    setCurrentPage("home");
  }, []);

  return (
    <>
      <PostCreate className="w-full border-b" />
      {data?.pages.map((page) =>
        page.posts.map((post) => (
          <Post key={post.postId} postId={post.postId} className="border-b" />
        )),
      )}
    </>
  );
}
