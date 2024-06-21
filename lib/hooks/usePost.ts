"use client";

import {
  createPost,
  getParentPosts,
  getPostById,
  getPosts,
  getPostsCountByUserId,
  getRepliesByUserId,
  getRepliesCountByPostId,
  logicDeletePost,
} from "@/lib/db/post";
import { queryClient } from "@/lib/queryClient";
import {
  skipToken,
  useInfiniteQuery,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

export const useAddPost = () => {
  return useMutation({
    mutationFn: createPost,
    onSuccess: (_data, { parentId, ownerId }) => {
      queryClient.invalidateQueries({
        queryKey: ["postId", parentId, "reply"],
      });
      queryClient.invalidateQueries({
        queryKey: ["userId", ownerId, "post"],
      });
    },
  });
};

export const useDeletePost = () => {
  return useMutation({
    mutationFn: logicDeletePost,
    onSuccess: (post) => {
      queryClient.setQueryData(["postId", post.id], post);
      queryClient.invalidateQueries({
        queryKey: ["userId", post.owner_id, "post"],
      });
      queryClient.invalidateQueries({
        queryKey: ["postId", post.parent_id, "reply"],
      });
    },
  });
};

export const usePostById = (postId?: number | null) => {
  return useQuery({
    queryKey: ["postId", postId],
    queryFn: postId ? () => getPostById(postId) : skipToken,
    enabled: !!postId,
  });
};

export const usePosts = () => {
  return useRepliesByParentId(0);
};

export const useRepliesByParentId = (parentId?: number) => {
  return useInfiniteQuery({
    queryKey: ["postId", parentId, "reply", "replies"],
    queryFn: ({ pageParam }) =>
      getPosts(pageParam).then((data) => {
        data.posts.forEach((post) => {
          queryClient.setQueryData(["postId", post.id], post);
        });
        return data;
      }),
    initialPageParam: { parentId },
    getNextPageParam: (lastPage) => lastPage.next,
    enabled: parentId !== undefined,
  });
};

export const usePostsByUserId = (userId?: string) => {
  return useInfiniteQuery({
    queryKey: ["userId", userId, "post", "posts"],
    queryFn: ({ pageParam }) =>
      getPosts(pageParam).then((data) => {
        data.posts.forEach((post) => {
          queryClient.setQueryData(["postId", post.id], post);
        });
        return data;
      }),
    initialPageParam: { parentId: 0 as number | undefined, ownerId: userId },
    getNextPageParam: (lastPage) => lastPage.next,
    enabled: !!userId,
  });
};

export const useRepliesCount = (postId?: number) => {
  return useQuery({
    queryKey: ["postId", postId, "reply", "repliesCount"],
    queryFn: postId ? () => getRepliesCountByPostId(postId) : skipToken,
    enabled: !!postId,
  });
};

export const usePostsCountByUserId = (userId?: string) => {
  return useQuery({
    queryKey: ["userId", userId, "post", "postsCount"],
    queryFn: userId ? () => getPostsCountByUserId(userId) : skipToken,
    enabled: !!userId,
  });
};

export const useParentPosts = (postId?: number | null) => {
  return useQuery({
    queryKey: ["parentPosts", postId],
    queryFn: postId
      ? () =>
          getParentPosts(postId).then((posts) => {
            posts.forEach((post) => {
              queryClient.setQueryData(["postId", post.id], post);
            });
            return posts;
          })
      : skipToken,
    enabled: !!postId,
  });
};

export const useRepliesByUserId = (userId?: string) => {
  return useInfiniteQuery({
    queryKey: ["userId", userId, "post", "replies"],
    queryFn: ({ pageParam }) =>
      getRepliesByUserId(pageParam).then((data) => {
        data.posts.forEach((post) => {
          !post.deleted && queryClient.setQueryData(["postId", post.id], post);
        });
        return data;
      }),
    initialPageParam: { userId: userId! },
    getNextPageParam: (lastPage) => lastPage.next,
    enabled: !!userId,
  });
};
