"use client";

import BackButton from "@/components/nav/back-button";
import BookmarkButton from "@/components/post/bookmark-button";
import LikeButton from "@/components/post/like-button";
import MoreButton from "@/components/post/more-button";
import Post from "@/components/post/post";
import PostCreate from "@/components/post/post-create";
import ReplyButton from "@/components/post/reply-button";
import RepostButton from "@/components/post/repost-button";
import { Button } from "@/components/ui/button";
import Name from "@/components/user/name";
import UserAvatar from "@/components/user/user-avatar";
import UserCard from "@/components/user/user-card";
import Username from "@/components/user/username";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import {
  useParentPosts,
  usePostById,
  useRepliesByParentId,
} from "@/lib/hooks/usePost";
import { useUserById, useUsersByIds } from "@/lib/hooks/useUser";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { useEffect, useRef } from "react";

export default function Status({
  params,
}: {
  params: { username: string; postId: string };
}) {
  const { postId } = params;

  const { data: post, isLoading } = usePostById(+postId);
  const { data: parent } = useParentPosts(post?.parent_id);
  const { data: owner } = useUserById(post?.owner_id);
  const { users: mentions } = useUsersByIds(post?.mentions);
  const {
    data: replies,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useRepliesByParentId(post?.id);
  useInfiniteScroll({
    fetchMore: fetchNextPage,
    hasMore: hasNextPage,
    isFetching: isFetchingNextPage,
  });

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollIntoView();
  }, [parent]);

  if (!isLoading && post?.deleted) return null;

  return (
    <>
      <div className="sticky top-0 z-[1] flex h-[53px] w-full items-center justify-center bg-white/85 px-4 backdrop-blur">
        <div className="flex min-w-14 items-center">
          <BackButton />
        </div>
        <div className="flex h-full flex-auto flex-col items-stretch justify-center">
          <h2 className="py-0.5 text-xl font-semibold">Post</h2>
        </div>
      </div>
      {parent
        ?.toReversed()
        .map((post) => <Post key={post.id} postId={post.id} mode="parent" />)}
      <div className="min-h-[calc(100dvh-53px)]">
        <div className="flex flex-col px-4" ref={ref}>
          <div className="flex">
            {!!post?.parent_id && (
              <div className="relative mb-1 mr-2 flex basis-10 flex-col">
                <div className="absolute inset-0 mx-auto w-0.5 bg-gray-300" />
              </div>
            )}
            <div className="grow pt-3" />
          </div>
          <div className="flex">
            <UserCard uid={owner?.id}>
              <UserAvatar uid={owner?.id} className="mr-2 size-10" />
            </UserCard>
            <div className="flex grow items-start justify-between">
              <div className="flex flex-col text-sm">
                <UserCard uid={owner?.id}>
                  <Name uid={owner?.id} />
                </UserCard>
                <UserCard uid={owner?.id}>
                  <Username uid={owner?.id} className="text-gray-500" />
                </UserCard>
              </div>
              <MoreButton postId={post?.id} />
            </div>
          </div>
          <div className="flex flex-col">
            <p className="mt-3">{post?.content}</p>
            <p className="my-4 text-sm text-gray-500">
              {dayjs(post?.created_at).format("hh:mm A · MMMM D, YYYY")}
            </p>
            <div className="flex h-12 justify-between gap-x-1 border-y px-1 text-gray-600">
              <div className="flex flex-1 items-center justify-start">
                <ReplyButton postId={post?.id} className="size-6" />
              </div>
              <div className="flex flex-1 items-center justify-start">
                <RepostButton postId={post?.id} className="size-6" />
              </div>
              <div className="flex flex-1 items-center justify-start">
                <LikeButton postId={post?.id} className="size-6" />
              </div>
              <div className="flex flex-1 items-center justify-start">
                <BookmarkButton postId={post?.id} className="size-6" />
              </div>
              <div className="flex items-center">
                <Button variant="ghost" size="sm" className="-m-2 h-auto p-2">
                  <ArrowUpTrayIcon className="size-6 stroke-2" />
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
              <span className="text-primary">
                {mentions?.map((mention) => ` @${mention?.username}`).join("")}
              </span>
            </p>
          </div>
          <PostCreate parentId={post?.id} />
        </div>
        {replies?.pages.map((page) =>
          page.posts.map((reply) => (
            <Post key={reply.id} postId={reply.id} className="border-b" />
          )),
        )}
      </div>
    </>
  );
}
