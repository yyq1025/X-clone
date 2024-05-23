"use client";

import {
  createPost,
  getPostById,
  getPostsByParentId,
  getPostsByUserId,
  getPostsCountByUserId,
  getRepliesByUserId,
  getRepliesCountByPostId,
} from "@/lib/db/post";
import { queryClient } from "@/lib/queryClient";
import type { Tables } from "@/lib/types/supabase";
import {
  skipToken,
  useInfiniteQuery,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

export const useAddPost = () => {
  return useMutation({
    mutationFn: ({
      parentId,
      ownerId,
      content,
      mentions,
    }: {
      parentId: string | null;
      ownerId: string;
      content: string;
      mentions: string[];
    }) =>
      createPost({
        parent_id: parentId,
        owner_id: ownerId,
        content,
        mentions,
      }),
    onSuccess: (data, { parentId, ownerId }) => {
      queryClient.invalidateQueries({
        queryKey: ["posts", "parentId", parentId],
      });
      queryClient.invalidateQueries({
        queryKey: ["postsCount", ownerId],
      });
      if (data.parent_id) {
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
          queryClient.setQueryData(["post", post.id], post);
        });
        return data;
      }),
    initialPageParam: { parentId: parentId as string | null, page: 0 },
    getNextPageParam: (lastPage) =>
      lastPage.next
        ? { parentId: parentId as string | null, page: lastPage.next }
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
          queryClient.setQueryData(["post", post.id], post);
        });
        return data;
      }),
    initialPageParam: { userId: userId as string, page: 0 },
    getNextPageParam: (lastPage) =>
      lastPage.next ? { userId: userId as string, page: lastPage.next } : null,
    enabled: !!userId,
  });
};

export const useRepliesCount = (postId?: string) => {
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

const getParentPosts = async (postId: string | null) => {
  const posts: Tables<"posts">[] = [];
  while (postId) {
    const post = await queryClient.fetchQuery({
      queryKey: ["post", postId],
      queryFn: ({ queryKey: [_, postId] }) => getPostById(postId),
    });
    if (!post) break;
    posts.push(post);
    postId = post.parent_id;
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
          queryClient.setQueryData(["post", post.id], post);
        });
        return data;
      }),
    initialPageParam: { userId: userId as string, page: 0 },
    getNextPageParam: (lastPage) =>
      lastPage.next ? { userId: userId as string, page: lastPage.next } : null,
    enabled: !!userId,
  });
};
