"use client";

import {
  getLiked,
  getLikedPostsByUserId,
  getLikesCountByPostId,
  getLikesCountByUserId,
  likePost,
  unlikePost,
} from "@/lib/db/like";
import { queryClient } from "@/lib/queryClient";
import type { Like } from "@prisma/client";
import {
  skipToken,
  useInfiniteQuery,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

export const useLikesCountByPostId = (postId?: string) => {
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
  postId?: string;
}) => {
  return useQuery({
    queryKey: ["liked", userId, postId],
    queryFn: userId && postId ? () => getLiked({ userId, postId }) : skipToken,
    enabled: !!userId && !!postId,
  });
};

const getPreviousData = async ({
  userId,
  postId,
}: Pick<Like, "userId" | "postId">) => {
  const previousLiked = queryClient.getQueryData([
    "liked",
    userId,
    postId,
  ]) as boolean;
  const previousLikesCount = queryClient.getQueryData([
    "likesCount",
    "postId",
    postId,
  ]) as number;

  return { previousLiked, previousLikesCount };
};

export const useLikePost = () => {
  return useMutation({
    mutationFn: likePost,
    onMutate: async ({ userId, postId }) => {
      const { previousLiked, previousLikesCount } = await getPreviousData({
        userId,
        postId,
      });

      queryClient.setQueryData(["liked", userId, postId], true);
      queryClient.setQueryData(
        ["likesCount", "postId", postId],
        previousLikesCount + 1,
      );

      return { previousLiked, previousLikesCount };
    },
    onError: (_err, _variables, context: any) => {
      queryClient.setQueryData(
        ["liked", context.userId, context.postId],
        context.previousLiked,
      );
      queryClient.setQueryData(
        ["likesCount", "postId", context.postId],
        context.previousLikesCount,
      );
    },
    onSuccess: (data, { userId, postId }) => {
      queryClient.setQueryData(["liked", userId, postId], data);
      queryClient.invalidateQueries({
        queryKey: ["likedPosts", "userId", userId],
      });
    },
    onSettled(_data, _err, { postId }) {
      queryClient.invalidateQueries({
        queryKey: ["likesCount", "postId", postId],
      });
    },
  });
};

export const useUnlikePost = () => {
  return useMutation({
    mutationFn: unlikePost,
    onMutate: async ({ userId, postId }) => {
      const { previousLiked, previousLikesCount } = await getPreviousData({
        userId,
        postId,
      });

      queryClient.setQueryData(["liked", userId, postId], false);
      queryClient.setQueryData(
        ["likesCount", "postId", postId],
        previousLikesCount - 1,
      );

      return { previousLiked, previousLikesCount };
    },
    onError: (_err, _variables, context: any) => {
      queryClient.setQueryData(
        ["liked", context.userId, context.postId],
        context.previousLiked,
      );
      queryClient.setQueryData(
        ["likesCount", "postId", context.postId],
        context.previousLikesCount,
      );
    },
    onSuccess: (data, { userId, postId }) => {
      queryClient.setQueryData(["liked", userId, postId], data);
      queryClient.invalidateQueries({
        queryKey: ["likedPosts", "userId", userId],
      });
    },
    onSettled(_data, _err, { postId }) {
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
          queryClient.setQueryData(["post", like.post.postId], like.post);
        });
        return data;
      }),
    initialPageParam: { userId: userId as string },
    getNextPageParam: (lastPage) =>
      lastPage.nextCursor
        ? { userId: userId as string, cursor: lastPage.nextCursor }
        : null,
    enabled: !!userId,
  });
};
