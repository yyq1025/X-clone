"use client";

import {
  createPost,
  getPostById,
  getPostsByParentId,
  getPostsByUserId,
  getPostsCountByUserId,
  getRepliesByUserId,
  getRepliesCount,
} from "@/lib/db/post";
import { queryClient } from "@/lib/queryClient";
import type { Post } from "@prisma/client";
import {
  skipToken,
  useInfiniteQuery,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

export const useAddPost = () => {
  return useMutation({
    mutationFn: createPost,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["posts", "parentId", data.parentId],
      });
      queryClient.invalidateQueries({
        queryKey: ["postsCount", data.ownerId],
      });
      if (data.parentId) {
        queryClient.invalidateQueries({
          queryKey: ["repliesCount", data.parentId],
        });
        queryClient.invalidateQueries({
          queryKey: ["replies", "userId", data.ownerId],
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: ["posts", "userId", data.ownerId],
        });
      }
    },
  });
};

export const usePostById = (postId?: string | null) => {
  return useQuery({
    queryKey: ["post", postId],
    queryFn: postId ? () => getPostById(postId) : skipToken,
    enabled: !!postId,
  });
};

export const usePostsByParentId = (parentId?: string | null) => {
  return useInfiniteQuery({
    queryKey: ["posts", "parentId", parentId],
    queryFn: ({ pageParam }) =>
      getPostsByParentId(pageParam).then((data) => {
        data.posts.forEach((post) => {
          queryClient.setQueryData(["post", post.postId], post);
        });
        return data;
      }),
    initialPageParam: { parentId: parentId as string | null },
    getNextPageParam: (lastPage) =>
      lastPage.nextCursor
        ? { parentId: parentId as string | null, cursor: lastPage.nextCursor }
        : null,
    enabled: parentId !== undefined,
  });
};

export const usePostsByUserId = (userId?: string) => {
  return useInfiniteQuery({
    queryKey: ["posts", "userId", userId],
    queryFn: ({ pageParam }) =>
      getPostsByUserId(pageParam).then((data) => {
        data.posts.forEach((post) => {
          queryClient.setQueryData(["post", post.postId], post);
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

export const useRepliesCount = (postId?: string) => {
  return useQuery({
    queryKey: ["repliesCount", postId],
    queryFn: postId ? () => getRepliesCount(postId) : skipToken,
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

const getParentPosts = async (postId: string | null) => {
  const posts: Omit<Post, "id">[] = [];
  while (postId) {
    const post = await queryClient.fetchQuery({
      queryKey: ["post", postId],
      queryFn: ({ queryKey: [_, postId] }) => getPostById(postId),
    });
    if (!post) break;
    posts.push(post);
    postId = post.parentId;
  }
  return posts;
};

export const useParentPosts = (postId?: string | null) => {
  return useQuery({
    queryKey: ["parentPosts", postId],
    queryFn: postId ? () => getParentPosts(postId) : skipToken,
    enabled: postId != undefined,
  });
};

export const useRepliesByUserId = (userId?: string) => {
  return useInfiniteQuery({
    queryKey: ["replies", "userId", userId],
    queryFn: ({ pageParam }) =>
      getRepliesByUserId(pageParam).then((data) => {
        data.posts.forEach((post) => {
          queryClient.setQueryData(["post", post.postId], post);
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
