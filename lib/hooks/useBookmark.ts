"use client";

import {
  bookmark,
  getBookmarked,
  getBookmarksByUserId,
  getBookmarksCount,
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
    queryKey: ["postId", postId, "bookmark", "bookmarksCount"],
    queryFn: postId ? () => getBookmarksCount(postId) : skipToken,
    enabled: !!postId,
  });
};

export const useBookmarksByUserId = (userId?: string) => {
  return useInfiniteQuery({
    queryKey: ["userId", userId, "bookmark", "bookmarks"],
    queryFn: ({ pageParam }) =>
      getBookmarksByUserId(pageParam).then((data) => {
        data.bookmarks.forEach((bookmark) => {
          bookmark.valid_posts &&
            queryClient.setQueryData(
              ["postId", bookmark.valid_posts.id],
              bookmark.valid_posts,
            );
        });
        return data;
      }),
    initialPageParam: { userId: userId! },
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
        ["postId", postId, "bookmark", "bookmarksCount"],
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
        ["postId", postId, "bookmark", "bookmarksCount"],
        context.previousBookmarksCount,
      );
    },
    onSuccess: (_data, { userId, postId }) => {
      queryClient.invalidateQueries({
        queryKey: ["userId", userId, "bookmark"],
      });
      queryClient.invalidateQueries({
        queryKey: ["postId", postId, "bookmark"],
      });
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
        ["postId", postId, "bookmark", "bookmarksCount"],
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
        ["postId", postId, "bookmark", "bookmarksCount"],
        context.previousBookmarksCount,
      );
    },
    onSuccess: (_data, { userId, postId }) => {
      queryClient.invalidateQueries({
        queryKey: ["userId", userId, "bookmark"],
      });
      queryClient.invalidateQueries({
        queryKey: ["postId", postId, "bookmark"],
      });
    },
  });
};
