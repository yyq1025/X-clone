"use client";

import Post from "@/components/post/post";
import { useBookmarksByUserId } from "@/lib/hooks/useBookmark";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { useUserById } from "@/lib/hooks/useUser";
import { useUserStore } from "@/lib/stores/user";

export default function Bookmarks() {
  const { userId } = useUserStore();
  const { data: user } = useUserById(userId);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useBookmarksByUserId(user?.id);

  useInfiniteScroll({
    fetchMore: fetchNextPage,
    hasMore: hasNextPage,
    isFetching: isFetchingNextPage,
  });

  return (
    <>
      <div className="sticky top-0 z-[1] flex h-[53px] w-full items-center justify-center bg-white/85 px-4 backdrop-blur">
        <div className="flex h-full flex-auto flex-col items-stretch justify-center">
          <h2 className="py-0.5 text-xl font-semibold">Bookmarks</h2>
          <p className="text-xs text-gray-500">@{user?.username}</p>
        </div>
      </div>
      {data?.pages.map((page) =>
        page.bookmarks.map(
          (bookmark) =>
            bookmark.valid_posts && (
              <Post
                key={bookmark.valid_posts.id}
                postId={bookmark.valid_posts.id}
                mode="withReplyTo"
                className="border-b"
              />
            ),
        ),
      )}
    </>
  );
}
