"use client";

import Post from "@/components/post/post";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { useLikedPostsByUserId } from "@/lib/hooks/useLike";
import { useUserByUsername } from "@/lib/hooks/useUser";

export default function Replies({
  params,
}: {
  params: { profileUsername: string };
}) {
  const { profileUsername } = params;
  const { data: profileUser } = useUserByUsername(profileUsername);
  const {
    data: likedPosts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useLikedPostsByUserId(profileUser?.id);

  useInfiniteScroll({
    fetchMore: fetchNextPage,
    hasMore: hasNextPage,
    isFetching: isFetchingNextPage,
  });

  return (
    <>
      {likedPosts?.pages.map((page) =>
        page.likedPosts.map(
          (post) =>
            post.posts && (
              <Post
                key={post.posts.id}
                postId={post.posts.id}
                mode="reply"
                className="border-b"
              />
            ),
        ),
      )}
    </>
  );
}
