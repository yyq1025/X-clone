"use client";

import Post from "@/components/post/post";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { useRepostedPostsByUserId } from "@/lib/hooks/useRepost";
import { useUserById, useUserIdByUsername } from "@/lib/hooks/useUser";

export default function Reposts({ params }: { params: { username: string } }) {
  const { username } = params;
  const { data } = useUserIdByUsername(username);
  const { data: user } = useUserById(data?.id);
  const {
    data: repostedPosts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useRepostedPostsByUserId(user?.id);

  useInfiniteScroll({
    fetchMore: fetchNextPage,
    hasMore: hasNextPage,
    isFetching: isFetchingNextPage,
  });

  return (
    <>
      {repostedPosts?.pages.map((page) =>
        page.repostedPosts.map(
          (post) =>
            post.valid_posts && (
              <Post
                key={post.valid_posts.id}
                postId={post.valid_posts.id}
                reposterId={user?.id}
                className="border-b"
              />
            ),
        ),
      )}
    </>
  );
}
