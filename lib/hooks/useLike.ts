"use client";

import {
  getLiked,
  getLikesCountByPostId,
  likePost,
  unlikePost,
} from "@/lib/db/like";
import { optimiticUpdate } from "@/lib/hooks/optimistic";
import { queryClient } from "@/lib/queryClient";
import {
  skipToken,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

export const useLikesCountByPostId = (postId?: number) => {
  return useQuery({
    queryKey: ["likesCount", "postId", postId],
    queryFn: postId ? () => getLikesCountByPostId(postId) : skipToken,
    enabled: !!postId,
  });
};

export const useLiked = ({
  userId,
  postId,
}: {
  userId?: string;
  postId?: number;
}) => {
  return useQuery({
    queryKey: ["liked", userId, postId],
    queryFn:
      userId && postId
        ? () => getLiked({ user_id: userId, post_id: postId })
        : skipToken,
    enabled: !!userId && !!postId,
  });
};

export const useLikePost = () => {
  return useMutation({
    mutationFn: ({ userId, postId }: { userId: string; postId: number }) =>
      likePost({ user_id: userId, post_id: postId }),
    onMutate: async ({ userId, postId }) => {
      const previousLiked = await optimiticUpdate(
        ["liked", userId, postId],
        true,
      );
      const previousLikesCount = await optimiticUpdate(
        ["likesCount", "postId", postId],
        (prev: number) => prev + 1,
      );

      return { previousLiked, previousLikesCount };
    },
    onError: (_err, { userId, postId }, context: any) => {
      queryClient.setQueryData(
        ["liked", userId, postId],
        context.previousLiked,
      );
      queryClient.setQueryData(
        ["likesCount", "postId", postId],
        context.previousLikesCount,
      );
    },
    onSuccess: (_data, { userId, postId }) => {
      queryClient.invalidateQueries({
        queryKey: ["likedPosts", "userId", userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["likesCount", "postId", postId],
      });
    },
  });
};

export const useUnlikePost = () => {
  return useMutation({
    mutationFn: ({ userId, postId }: { userId: string; postId: number }) =>
      unlikePost({ user_id: userId, post_id: postId }),
    onMutate: async ({ userId, postId }) => {
      const previousLiked = await optimiticUpdate(
        ["liked", userId, postId],
        false,
      );
      const previousLikesCount = await optimiticUpdate(
        ["likesCount", "postId", postId],
        (prev: number) => prev - 1,
      );

      return { previousLiked, previousLikesCount };
    },
    onError: (_err, { userId, postId }, context: any) => {
      queryClient.setQueryData(
        ["liked", userId, postId],
        context.previousLiked,
      );
      queryClient.setQueryData(
        ["likesCount", "postId", postId],
        context.previousLikesCount,
      );
    },
    onSuccess: (_data, { userId, postId }) => {
      queryClient.invalidateQueries({
        queryKey: ["likedPosts", "userId", userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["likesCount", "postId", postId],
      });
    },
  });
};
