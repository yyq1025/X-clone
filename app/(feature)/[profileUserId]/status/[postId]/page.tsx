"use client";

import Like from "@/components/post/like";
import Post from "@/components/post/post";
import PostCreate from "@/components/post/post-create";
import ReplyModal from "@/components/post/reply-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import {
  useParentPosts,
  usePostById,
  usePostsByParentId,
} from "@/lib/hooks/usePost";
import { useUserById, useUsersByIds } from "@/lib/hooks/useUser";
import { usePageStore } from "@/lib/stores/page";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { ArrowLeft, Bookmark, Heart, MessageSquare, Share } from "lucide-react";
import { useEffect, useRef } from "react";

export default function Status({
  params,
}: {
  params: { profileUserId: string; postId: string };
}) {
  const { postId } = params;
  const { setCurrentPage } = usePageStore();

  useEffect(() => {
    setCurrentPage("status");
  }, [setCurrentPage]);

  const { data: post } = usePostById(postId);
  const { data: parent } = useParentPosts(post?.parentId);
  const { data: owner } = useUserById(post?.ownerId);
  const { users: mentions } = useUsersByIds(post?.mentions);
  const {
    data: replies,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePostsByParentId(post?.postId);
  useInfiniteScroll({
    fetchMore: fetchNextPage,
    hasMore: hasNextPage,
    isFetching: isFetchingNextPage,
  });

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollIntoView();
  }, [parent]);

  return (
    <>
      <div className="sticky top-0 z-[1] flex h-[53px] w-full items-center justify-center bg-white/85 px-2 backdrop-blur">
        <div className="flex min-w-16 flex-col items-start justify-center self-stretch">
          <Button size="sm" variant="ghost">
            <ArrowLeft size={20} />
          </Button>
        </div>
        <div className="flex h-full flex-auto flex-col items-stretch justify-center">
          <h2 className="py-0.5 text-xl font-bold">Post</h2>
        </div>
      </div>
      {parent
        ?.toReversed()
        .map((post) => (
          <Post key={post.postId} postId={post.postId} mode="status" />
        ))}
      <div className="min-h-[calc(100dvh-53px)]">
        <div className="flex flex-col px-4" ref={ref}>
          <div className="flex">
            {post?.parentId && (
              <div className="relative mb-1 mr-2 flex basis-10 flex-col">
                <div className="absolute inset-0 mx-auto w-0.5 bg-gray-300" />
              </div>
            )}
            <div className="grow pt-3" />
          </div>
          <div className="flex">
            <Avatar className="mr-2 h-10 w-10">
              <AvatarImage src={owner?.avatar || ""} alt={owner?.name || ""} />
              <AvatarFallback>
                {owner?.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{owner?.name}</span>
                <span className="text-sm text-gray-500">
                  @{owner?.username}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <p className="mt-3">{post?.content}</p>
            <p className="my-4 text-sm text-gray-500">
              {dayjs(post?.createdAt).format("hh:mm A · MMMM D, YYYY")}
            </p>
            <div className="flex h-12 justify-between gap-x-1 border-y text-gray-500">
              <div className="flex flex-1 items-center justify-start">
                <ReplyModal
                  postId={post?.postId}
                  renderTrigger={({ buttonProps, repliesCount }) => (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1"
                      {...buttonProps}
                    >
                      <MessageSquare size={20} />
                      <span className="text-sm">
                        {!!repliesCount && repliesCount}
                      </span>
                    </Button>
                  )}
                />
              </div>
              <div className="flex flex-1 items-center justify-start">
                <Like
                  postId={post?.postId}
                  render={({ buttonProps, liked, likesCount }) => (
                    <Button
                      {...buttonProps}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "gap-1",
                        liked && "text-red-500 hover:text-red-500",
                      )}
                    >
                      <Heart
                        size={20}
                        className={cn(liked && "fill-red-500")}
                      />
                      {!!likesCount && (
                        <span className="text-sm">{likesCount}</span>
                      )}
                    </Button>
                  )}
                />
              </div>
              <div className="flex flex-1 items-center justify-start">
                <Button variant="ghost" size="sm">
                  <Bookmark size={20} />
                </Button>
              </div>
              <div className="flex items-center">
                <Button variant="ghost" size="sm">
                  <Share size={20} />
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col border-b pb-3 pt-1">
          <div className="flex px-4">
            <div className="mr-2 basis-10" />
            <p className="text-sm text-gray-500">
              Replying to
              <span className="text-blue-500">
                {mentions?.map((mention) => ` @${mention?.username}`).join("")}
              </span>
            </p>
          </div>
          <PostCreate parentId={post?.postId} />
        </div>
        {replies?.pages.map((page) =>
          page.posts.map((reply) => (
            <Post
              key={reply.postId}
              postId={reply.postId}
              className="border-b"
            />
          )),
        )}
      </div>
    </>
  );
}
