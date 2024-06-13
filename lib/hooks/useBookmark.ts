"use client";

import {
  bookmark,
  getBookmarked,
  getBookmarksByUserId,
  getBookmarksCount,
  removeAllBookmarksByUserId,
  unbookmark,
} from "@/lib/db/bookmark";
import { optimiticUpdate } from "@/lib/hooks/optimistic";
import { queryClient } from "@/lib/queryClient";
import {
  skipToken,
  useInfiniteQuery,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

export const useBookmarked = ({
  userId,
  postId,
}: {
  userId?: string;
  postId?: number;
}) => {
  return useQuery({
    queryKey: ["bookmarked", userId, postId],
    queryFn:
      userId && postId
        ? () => getBookmarked({ user_id: userId, post_id: postId })
        : skipToken,
    enabled: !!userId && !!postId,
  });
};

export const useBookmarksCount = (postId?: number) => {
  return useQuery({
    queryKey: ["bookmarksCount", postId],
    queryFn: postId ? () => getBookmarksCount(postId) : skipToken,
    enabled: !!postId,
  });
};

export const useBookmarksByUserId = (userId?: string) => {
  return useInfiniteQuery({
    queryKey: ["bookmarks", userId],
    queryFn: ({ pageParam }) =>
      getBookmarksByUserId(pageParam).then((data) => {
        data.bookmarks.forEach((bookmark) => {
          bookmark.valid_posts &&
            queryClient.setQueryData(
              ["post", bookmark.valid_posts.id],
              bookmark.valid_posts,
            );
        });
        return data;
      }),
    initialPageParam: { userId: userId as string },
    getNextPageParam: (lastPage) => lastPage.next,
    enabled: !!userId,
  });
};

export const useBookmark = () => {
  return useMutation({
    mutationFn: ({ userId, postId }: { userId: string; postId: number }) =>
      bookmark({ user_id: userId, post_id: postId }),
    onMutate: async ({ userId, postId }) => {
      const previousBookmarked = await optimiticUpdate(
        ["bookmarked", userId, postId],
        true,
      );
      const previousBookmarksCount = await optimiticUpdate(
        ["bookmarksCount", postId],
        (prev: number) => prev + 1,
      );
      return { previousBookmarked, previousBookmarksCount };
    },
    onError: (_error, { userId, postId }, context: any) => {
      queryClient.setQueryData(
        ["bookmarked", userId, postId],
        context.previousBookmarked,
      );
      queryClient.setQueryData(
        ["bookmarksCount", postId],
        context.previousBookmarksCount,
      );
    },
    onSuccess: (_data, { userId, postId }) => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks", userId] });
      queryClient.invalidateQueries({ queryKey: ["bookmarksCount", postId] });
    },
  });
};

export const useUnbookmark = () => {
  return useMutation({
    mutationFn: ({ userId, postId }: { userId: string; postId: number }) =>
      unbookmark({ user_id: userId, post_id: postId }),
    onMutate: async ({ userId, postId }) => {
      const previousBookmarked = await optimiticUpdate(
        ["bookmarked", userId, postId],
        false,
      );
      const previousBookmarksCount = await optimiticUpdate(
        ["bookmarksCount", postId],
        (prev: number) => prev - 1,
      );
      return { previousBookmarked, previousBookmarksCount };
    },
    onError: (_error, { userId, postId }, context: any) => {
      queryClient.setQueryData(
        ["bookmarked", userId, postId],
        context.previousBookmarked,
      );
      queryClient.setQueryData(
        ["bookmarksCount", postId],
        context.previousBookmarksCount,
      );
    },
    onSuccess: (_data, { userId, postId }) => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks", userId] });
      queryClient.invalidateQueries({ queryKey: ["bookmarksCount", postId] });
    },
  });
};

export const useRemoveAllBookmarks = () => {
  return useMutation({
    mutationFn: removeAllBookmarksByUserId,
    onSuccess: (_data, userId) => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks", userId] });
    },
  });
};
