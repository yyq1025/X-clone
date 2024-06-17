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
        queryKey: ["posts", "parentId", parentId],
      });
      queryClient.invalidateQueries({
        queryKey: ["postsCount", ownerId],
      });
      if (parentId) {
        queryClient.invalidateQueries({
          queryKey: ["repliesCount", parentId],
        });
        queryClient.invalidateQueries({
          queryKey: ["replies", "userId", ownerId],
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: ["posts", "userId", ownerId],
        });
      }
    },
  });
};

export const useDeletePost = () => {
  return useMutation({
    mutationFn: logicDeletePost,
    onSuccess: (post) => {
      queryClient.setQueryData(["post", post.id], post);
      queryClient.invalidateQueries({
        queryKey: ["postsCount", post.owner_id],
      });
      if (post.parent_id) {
        queryClient.invalidateQueries({
          queryKey: ["repliesCount", post.parent_id],
        });
      }
    },
  });
};

export const usePostById = (postId?: number | null) => {
  return useQuery({
    queryKey: ["post", postId],
    queryFn: postId ? () => getPostById(postId) : skipToken,
    enabled: !!postId,
  });
};

export const usePosts = () => {
  return useRepliesByParentId(0);
};

export const useRepliesByParentId = (parentId?: number) => {
  return useInfiniteQuery({
    queryKey: ["posts", "parentId", parentId],
    queryFn: ({ pageParam }) =>
      getPosts(pageParam).then((data) => {
        data.posts.forEach((post) => {
          queryClient.setQueryData(["post", post.id], post);
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
    queryKey: ["posts", "userId", userId],
    queryFn: ({ pageParam }) =>
      getPosts(pageParam).then((data) => {
        data.posts.forEach((post) => {
          queryClient.setQueryData(["post", post.id], post);
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
    queryKey: ["repliesCount", postId],
    queryFn: postId ? () => getRepliesCountByPostId(postId) : skipToken,
    enabled: !!postId,
  });
};

export const usePostsCountByUserId = (userId?: string) => {
  return useQuery({
    queryKey: ["postsCount", userId],
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
              queryClient.setQueryData(["post", post.id], post);
            });
            return posts;
          })
      : skipToken,
    enabled: !!postId,
  });
};

export const useRepliesByUserId = (userId?: string) => {
  return useInfiniteQuery({
    queryKey: ["replies", "userId", userId],
    queryFn: ({ pageParam }) =>
      getRepliesByUserId(pageParam).then((data) => {
        data.posts.forEach((post) => {
          !post.deleted && queryClient.setQueryData(["post", post.id], post);
        });
        return data;
      }),
    initialPageParam: { userId: userId as string },
    getNextPageParam: (lastPage) => lastPage.next,
    enabled: !!userId,
  });
};
