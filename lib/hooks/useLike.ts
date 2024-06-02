"use client";

import {
  getLiked,
  getLikedPostsByUserId,
  getLikesCountByPostId,
  getLikesCountByUserId,
  likePost,
  unlikePost,
} from "@/lib/db/like";
import { optimiticUpdate } from "@/lib/hooks/optimistic";
import { queryClient } from "@/lib/queryClient";
import {
  skipToken,
  useInfiniteQuery,
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

export const useLikesCountByUserId = (userId?: string) => {
  return useQuery({
    queryKey: ["likesCount", "userId", userId],
    queryFn: userId ? () => getLikesCountByUserId(userId) : skipToken,
    enabled: !!userId,
  });
};

export const useLikedPostsByUserId = (userId?: string) => {
  return useInfiniteQuery({
    queryKey: ["likedPosts", "userId", userId],
    queryFn: ({ pageParam }) =>
      getLikedPostsByUserId(pageParam).then((data) => {
        data.likedPosts.forEach((like) => {
          like.valid_posts &&
            queryClient.setQueryData(
              ["post", like.valid_posts.id],
              like.valid_posts,
            );
        });
        return data;
      }),
    initialPageParam: { userId: userId as string },
    getNextPageParam: (lastPage) => lastPage.next,
    enabled: !!userId,
  });
};
