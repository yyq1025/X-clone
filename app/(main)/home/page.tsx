"use client";

import Post from "@/components/post/post";
import PostCreate from "@/components/post/post-create";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { useFollowingPosts, usePosts } from "@/lib/hooks/usePost";
import { useUserStore } from "@/lib/stores/user";
import { Content, List, Root, Trigger } from "@radix-ui/react-tabs";

export default function Home() {
  const { userId } = useUserStore();
  const {
    data: allPosts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePosts();

  useInfiniteScroll({
    fetchMore: fetchNextPage,
    hasMore: hasNextPage,
    isFetching: isFetchingNextPage,
  });

  const { data: followingPosts } = useFollowingPosts(userId);

  return (
    <Root defaultValue="forYou">
      <List className="sticky top-0 z-[1] flex h-[53px] w-full border-b bg-white/85 text-gray-500 backdrop-blur">
        <Trigger
          value="forYou"
          className="grow font-medium transition-colors hover:bg-accent data-[state=active]:font-semibold data-[state=active]:text-foreground"
        >
          For you
        </Trigger>
        <Trigger
          value="following"
          className="grow font-medium transition-colors hover:bg-accent data-[state=active]:font-semibold data-[state=active]:text-foreground"
        >
          Following
        </Trigger>
      </List>
      <PostCreate className="w-full border-b" />
      <Content value="forYou">
        {allPosts?.pages.map((page) =>
          page.posts.map((post) => (
            <Post key={post.id} postId={post.id} className="border-b" />
          )),
        )}
      </Content>
      <Content value="following">
        {followingPosts?.map((post, index) => (
          <Post
            key={index}
            postId={post.id}
            reposterId={post.type === "repost" ? post.user_id! : undefined}
            className="border-b"
          />
        ))}
      </Content>
    </Root>
  );
}
