"use server";

import { PAGE_SIZE } from "@/lib/db/constant";
import prisma from "@/lib/prisma";
import type { Post } from "@prisma/client";

export const createPost = async (
  post: Pick<Post, "parentId" | "ownerId" | "content" | "mentions">,
) => {
  return prisma.post.create({ data: post });
};

export const getPostById = async (postId: string) => {
  console.log("getPostById", postId);
  return prisma.post.findUnique({ where: { postId }, omit: { id: true } });
};

export const getPostsByParentId = async ({
  parentId,
  cursor,
}: {
  parentId: string | null;
  cursor?: string;
}) => {
  const queryResults = await prisma.post.findMany({
    where: { parentId },
    take: PAGE_SIZE,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { postId: cursor } : undefined,
    orderBy: { createdAt: "desc" },
    omit: {
      id: true,
    },
  });

  return {
    posts: queryResults,
    nextCursor:
      queryResults.length === PAGE_SIZE
        ? queryResults[queryResults.length - 1].postId
        : null,
  };
};

export const getPostsByUserId = async ({
  userId,
  cursor,
}: {
  userId: string;
  cursor?: string;
}) => {
  const queryResults = await prisma.post.findMany({
    where: { ownerId: userId, parentId: null },
    take: PAGE_SIZE,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { postId: cursor } : undefined,
    orderBy: { createdAt: "desc" },
    omit: {
      id: true,
    },
  });

  return {
    posts: queryResults,
    nextCursor: queryResults.length
      ? queryResults[queryResults.length - 1].postId
      : null,
  };
};

export const getRepliesCount = async (postId: string) => {
  return prisma.post.count({ where: { parentId: postId } });
};

export const getPostsCountByUserId = async (userId: string) => {
  return prisma.post.count({ where: { ownerId: userId } });
};

export const getRepliesByUserId = async ({
  userId,
  cursor,
}: {
  userId: string;
  cursor?: string;
}) => {
  const queryResults = await prisma.post.findMany({
    where: { ownerId: userId, parentId: { not: null } },
    take: PAGE_SIZE,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { postId: cursor } : undefined,
    orderBy: { createdAt: "desc" },
    omit: {
      id: true,
    },
  });

  return {
    posts: queryResults,
    nextCursor: queryResults.length
      ? queryResults[queryResults.length - 1].postId
      : null,
  };
};
