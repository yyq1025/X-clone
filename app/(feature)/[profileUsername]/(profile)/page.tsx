"use client";

import Post from "@/components/post/post";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { usePostsByUserId } from "@/lib/hooks/usePost";
import { useUserByUsername } from "@/lib/hooks/useUser";

export default function Posts({
  params,
}: {
  params: { profileUsername: string };
}) {
  const { profileUsername } = params;
  const { data: profileUser } = useUserByUsername(profileUsername);
  const {
    data: posts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePostsByUserId(profileUser?.id);

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
