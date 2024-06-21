"use client";

import {
  follow,
  getFollowed,
  getFollowersCountByUserId,
  getFollowingCountByUserId,
  getFollowingPosts,
  getUserFollowersByUserId,
  getUserFollowingByUserId,
  unfollow,
} from "@/lib/db/follow";
import { optimiticUpdate } from "@/lib/hooks/optimistic";
import { queryClient } from "@/lib/queryClient";
import {
  skipToken,
  useInfiniteQuery,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { omit } from "lodash";

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
    queryKey: ["userId", userId, "follow", "followingCount"],
    queryFn: userId ? () => getFollowingCountByUserId(userId) : skipToken,
    enabled: !!userId,
  });
};

export const useFollowersCount = (userId?: string) => {
  return useQuery({
    queryKey: ["userId", userId, "follow", "followersCount"],
    queryFn: userId ? () => getFollowersCountByUserId(userId) : skipToken,
    enabled: !!userId,
  });
};

export const useUserFollowing = (userId?: string) => {
  return useInfiniteQuery({
    queryKey: ["userId", userId, "follow", "following"],
    queryFn: ({ pageParam }) =>
      getUserFollowingByUserId(pageParam).then((users) => {
        users.following.forEach((following) => {
          queryClient.setQueryData(
            ["userId", following.users.id],
            following.users,
          );
        });
        return users;
      }),
    initialPageParam: { userId: userId! },
    getNextPageParam: (lastPage) => lastPage.next,
  });
};

export const useUserFollowers = (userId?: string) => {
  return useInfiniteQuery({
    queryKey: ["userId", userId, "follow", "followers"],
    queryFn: ({ pageParam }) =>
      getUserFollowersByUserId(pageParam).then((users) => {
        users.followers.forEach((follower) => {
          queryClient.setQueryData(
            ["userId", follower.users.id],
            follower.users,
          );
        });
        return users;
      }),
    initialPageParam: { userId: userId! },
    getNextPageParam: (lastPage) => lastPage.next,
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
        ["userId", followerId, "follow", "followingCount"],
        (prev: number) => prev + 1,
      );
      const previousFollowersCount = await optimiticUpdate(
        ["userId", followingId, "follow", "followersCount"],
        (prev: number) => prev + 1,
      );
      return {
        previousFollowed,
        previousFollowingCount,
        previousFollowersCount,
      };
    },
    onError: (_error, { followerId, followingId }, context: any) => {
      queryClient.setQueryData(
        ["followed", followerId, followingId],
        context.previousFollowed,
      );
      queryClient.setQueryData(
        ["userId", followerId, "follow", "followingCount"],
        context.previousFollowingCount,
      );
      queryClient.setQueryData(
        ["userId", followingId, "follow", "followersCount"],
        context.previousFollowersCount,
      );
    },
    onSuccess: (_data, { followerId, followingId }) => {
      queryClient.invalidateQueries({
        queryKey: ["userId", followerId, "follow"],
      });
      queryClient.invalidateQueries({
        queryKey: ["userId", followingId, "follow"],
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
        ["userId", followerId, "follow", "followingCount"],
        (prev: number) => prev - 1,
      );
      const previousFollowersCount = await optimiticUpdate(
        ["userId", followingId, "follow", "followersCount"],
        (prev: number) => prev - 1,
      );
      return {
        previousFollowed,
        previousFollowingCount,
        previousFollowersCount,
      };
    },
    onError: (_error, { followerId, followingId }, context: any) => {
      queryClient.setQueryData(
        ["followed", followerId, followingId],
        context.previousFollowed,
      );
      queryClient.setQueryData(
        ["userId", followerId, "follow", "followingCount"],
        context.previousFollowingCount,
      );
      queryClient.setQueryData(
        ["userId", followingId, "follow", "followersCount"],
        context.previousFollowersCount,
      );
    },
    onSuccess: (_data, { followerId, followingId }) => {
      queryClient.invalidateQueries({
        queryKey: ["userId", followerId, "follow"],
      });
      queryClient.invalidateQueries({
        queryKey: ["userId", followingId, "follow"],
      });
    },
  });
};

export const useFollowingPosts = (userId?: string) => {
  return useQuery({
    queryKey: ["userId", userId, "follow", "followingPosts"],
    queryFn: () =>
      getFollowingPosts().then((posts) => {
        posts.forEach((post) => {
          queryClient.setQueryData(
            ["postId", post.id],
            omit(post, ["type", "action_created_at", "user_id"]),
          );
        });
        return posts;
      }),
    enabled: !!userId,
  });
};
