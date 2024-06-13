"use client";

import Post from "@/components/post/post";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { useLikedPostsByUserId } from "@/lib/hooks/useLike";
import { useUserByUsername } from "@/lib/hooks/useUser";

export default function Replies({ params }: { params: { username: string } }) {
  const { username } = params;
  const { data: user } = useUserByUsername(username);
  const {
    data: likedPosts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useLikedPostsByUserId(user?.id);

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
            post.valid_posts && (
              <Post
                key={post.valid_posts.id}
                postId={post.valid_posts.id}
                mode="withReplyTo"
                className="border-b"
              />
            ),
        ),
      )}
    </>
  );
}
