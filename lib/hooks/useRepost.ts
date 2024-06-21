"use client";

import {
  getRepostCountByPostId,
  getReposted,
  getRepostedPostsByUserId,
  repost,
  unrepost,
} from "@/lib/db/repost";
import { optimiticUpdate } from "@/lib/hooks/optimistic";
import { queryClient } from "@/lib/queryClient";
import {
  skipToken,
  useInfiniteQuery,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

export const useRepostCountByPostId = (postId?: number) => {
  return useQuery({
    queryKey: ["postId", postId, "repost", "repostCount"],
    queryFn: postId ? () => getRepostCountByPostId(postId) : skipToken,
    enabled: !!postId,
  });
};

export const useReposted = ({
  userId,
  postId,
}: {
  userId?: string;
  postId?: number;
}) => {
  return useQuery({
    queryKey: ["reposted", userId, postId],
    queryFn:
      userId && postId
        ? () => getReposted({ user_id: userId, post_id: postId })
        : skipToken,
    enabled: !!userId && !!postId,
  });
};

export const useRepost = () => {
  return useMutation({
    mutationFn: ({ userId, postId }: { userId: string; postId: number }) =>
      repost({ user_id: userId, post_id: postId }),
    onMutate: async ({ userId, postId }) => {
      const previousReposted = await optimiticUpdate(
        ["reposted", userId, postId],
        true,
      );
      const previousRepostCount = await optimiticUpdate(
        ["postId", postId, "repost", "repostCount"],
        (prev: number) => prev + 1,
      );

      return { previousReposted, previousRepostCount };
    },
    onError: (_err, { userId, postId }, context: any) => {
      queryClient.setQueryData(
        ["reposted", userId, postId],
        context.previousReposted,
      );
      queryClient.setQueryData(
        ["postId", postId, "repost", "repostCount"],
        context.ppreviousRepostCount,
      );
    },
    onSuccess: (_data, { userId, postId }) => {
      queryClient.invalidateQueries({
        queryKey: ["userId", userId, "post"],
      });
      queryClient.invalidateQueries({
        queryKey: ["postId", postId, "repost"],
      });
    },
  });
};

export const useUnrepost = () => {
  return useMutation({
    mutationFn: ({ userId, postId }: { userId: string; postId: number }) =>
      unrepost({ user_id: userId, post_id: postId }),
    onMutate: async ({ userId, postId }) => {
      const previousReposted = await optimiticUpdate(
        ["reposted", userId, postId],
        false,
      );
      const previousRepostCount = await optimiticUpdate(
        ["postId", postId, "repost", "repostCount"],
        (prev: number) => prev - 1,
      );

      return { previousReposted, previousRepostCount };
    },
    onError: (_err, { userId, postId }, context: any) => {
      queryClient.setQueryData(
        ["reposted", userId, postId],
        context.previousReposted,
      );
      queryClient.setQueryData(
        ["postId", postId, "repost", "repostCount"],
        context.ppreviousRepostCount,
      );
    },
    onSuccess: (_data, { userId, postId }) => {
      queryClient.invalidateQueries({
        queryKey: ["userId", userId, "post"],
      });
      queryClient.invalidateQueries({
        queryKey: ["postId", postId, "repost"],
      });
    },
  });
};

export const useRepostedPostsByUserId = (userId?: string) => {
  return useInfiniteQuery({
    queryKey: ["userId", userId, "post", "repostedPosts"],
    queryFn: ({ pageParam }) =>
      getRepostedPostsByUserId(pageParam).then((data) => {
        data.repostedPosts.forEach((repost) => {
          repost.valid_posts &&
            queryClient.setQueryData(
              ["postId", repost.valid_posts.id],
              repost.valid_posts,
            );
        });
        return data;
      }),
    initialPageParam: { userId: userId! },
    getNextPageParam: (lastPage) => lastPage.next,
    enabled: !!userId,
  });
};
