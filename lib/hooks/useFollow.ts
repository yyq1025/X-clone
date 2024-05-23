"use client";

import { optimiticUpdate } from "@/lib/common/optimistic";
import {
  follow,
  getFollowed,
  getFollowersCountByUserId,
  getFollowingCountByUserId,
  getUserFollowersByUserId,
  getUserFollowingByUserId,
  unfollow,
} from "@/lib/db/follow";
import { queryClient } from "@/lib/queryClient";
import { Tables } from "@/lib/types/supabase";
import {
  skipToken,
  useInfiniteQuery,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

export const useFollowed = ({
  followerId,
  followingId,
}: {
  followerId?: string;
  followingId?: string;
}) => {
  return useQuery({
    queryKey: ["followed", followerId, followingId],
    queryFn:
      followerId && followingId
        ? () =>
            getFollowed({ follower_id: followerId, following_id: followingId })
        : skipToken,
    enabled: !!followerId && !!followingId,
  });
};

export const useFollowingCount = (userId?: string) => {
  return useQuery({
    queryKey: ["followingCount", userId],
    queryFn: userId ? () => getFollowingCountByUserId(userId) : skipToken,
    enabled: !!userId,
  });
};

export const useFollowersCount = (userId?: string) => {
  return useQuery({
    queryKey: ["followersCount", userId],
    queryFn: userId ? () => getFollowersCountByUserId(userId) : skipToken,
    enabled: !!userId,
  });
};

export const useUserFollowing = (userId?: string) => {
  return useInfiniteQuery({
    queryKey: ["following", userId],
    queryFn: ({ pageParam }) =>
      getUserFollowingByUserId(pageParam).then((users) => {
        users.following.forEach((following) => {
          queryClient.setQueryData(
            ["user", "userId", following.users.id],
            following.users,
          );
        });
        return users;
      }),
    initialPageParam: { userId: userId as string, page: 0 },
    getNextPageParam: (lastPage) =>
      lastPage.next
        ? {
            userId: userId as string,
            page: lastPage.next,
          }
        : null,
  });
};

export const useUserFollowers = (userId?: string) => {
  return useInfiniteQuery({
    queryKey: ["followers", userId],
    queryFn: ({ pageParam }) =>
      getUserFollowersByUserId(pageParam).then((users) => {
        users.followers.forEach((follower) => {
          queryClient.setQueryData(
            ["user", "userId", follower.users.id],
            follower.users,
          );
        });
        return users;
      }),
    initialPageParam: { userId: userId as string, page: 0 },
    getNextPageParam: (lastPage) =>
      lastPage.next
        ? {
            userId: userId as string,
            page: lastPage.next,
          }
        : null,
  });
};

export const useFollow = () => {
  return useMutation({
    mutationFn: ({
      followerId,
      followingId,
    }: {
      followerId: string;
      followingId: string;
    }) => follow({ follower_id: followerId, following_id: followingId }),
    onMutate: async ({ followerId, followingId }) => {
      const previousFollowed = await optimiticUpdate(
        ["followed", followerId, followingId],
        true,
      );
      const previousFollowingCount = await optimiticUpdate(
        ["followingCount", followerId],
        (prev: number) => prev + 1,
      );
      return { previousFollowed, previousFollowingCount };
    },
    onError: (_error, { followerId, followingId }, context: any) => {
      queryClient.setQueryData(
        ["followed", followerId, followingId],
        context.previousFollowed,
      );
      queryClient.setQueryData(
        ["followingCount", followerId],
        context.previousFollowingCount,
      );
    },
    onSuccess: (data, { followerId, followingId }) => {
      queryClient.setQueryData(["followed", followerId, followingId], data);
      queryClient.invalidateQueries({
        queryKey: ["followingCount", followerId],
      });
      queryClient.invalidateQueries({
        queryKey: ["following", followerId],
      });
    },
  });
};

export const useUnfollow = () => {
  return useMutation({
    mutationFn: ({
      followerId,
      followingId,
    }: {
      followerId: string;
      followingId: string;
    }) => unfollow({ follower_id: followerId, following_id: followingId }),
    onMutate: async ({ followerId, followingId }) => {
      const previousFollowed = await optimiticUpdate(
        ["followed", followerId, followingId],
        false,
      );
      const previousFollowingCount = await optimiticUpdate(
        ["followingCount", followerId],
        (prev: number) => prev - 1,
      );
      return { previousFollowed, previousFollowingCount };
    },
    onError: (_error, { followerId, followingId }, context: any) => {
      queryClient.setQueryData(
        ["followed", followerId, followingId],
        context.previousFollowed,
      );
      queryClient.setQueryData(
        ["followingCount", followerId],
        context.previousFollowingCount,
      );
    },
    onSuccess: (data, { followerId, followingId }) => {
      queryClient.setQueryData(["followed", followerId, followingId], data);
      queryClient.invalidateQueries({
        queryKey: ["followingCount", followerId],
      });
      queryClient.invalidateQueries({
        queryKey: ["following", followerId],
      });
    },
  });
};
